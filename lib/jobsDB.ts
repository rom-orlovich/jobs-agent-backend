import { AggregationCursor, Collection } from 'mongodb';
import { mongoDB } from '../src/server';
import { Job, JobPost } from '../src/jobsScanner/jobsScanner.types';
import { EXPIRE_AT_MONGO_DB } from '../src/jobsScanner/user/UserQuery';
import { GenericRecord, OmitKey, PickKey } from './types';

export interface QueryOptions {
  title?: string;
  reason?: string;
  from?: string;
  page?: string;
  limit?: string;
}

export interface QueryOptionsRes {
  match: GenericRecord<RegExp>;
  page: number;
  limit: number;
}

export type JobsPostsResultAgg = { data: JobPost[]; pagination: { total: number }[] };
export type JobPostResultAggTransform = PickKey<JobsPostsResultAgg, 'data'> &
  PickKey<JobsPostsResultAgg, 'pagination'>['pagination'];

export class JobsDB {
  jobsDB: Collection;
  constructor() {
    this.jobsDB = mongoDB.createDBcollection('jobs-agent-db', 'jobs');
  }

  /**
   * Create ttl(Time to live) index for jobs collections.
   * Check if the ttl index is exist. If it doesn't create one.
   * Otherwise, print appropriate message.
   */
  async createTTLindex() {
    try {
      const indexesArr = await this.jobsDB.indexExists('createdAt_1');
      if (!indexesArr) {
        console.log('create Index');
        await this.jobsDB.createIndex({ createdAt: 1 }, { expireAfterSeconds: EXPIRE_AT_MONGO_DB });
      } else {
        console.log('Index ttl is exist');
      }
    } catch (error) {
      console.log(error);
    }
  }

  private regexStartWith(str: string) {
    return new RegExp(`^${str}`);
  }

  /**
   * @param {JobsQueryOptions} options How the user wants to filter the data.
   * @returns {GenericRecord<RegExp>} The match object. The keys are the fields the user wants to filter
   * by them and the values are regex.
   */
  private createMatchOptions(options?: QueryOptions): GenericRecord<RegExp> {
    if (!options) return {};
    const match: GenericRecord<RegExp> = {};
    const { from, reason, title } = options;
    if (from) match['from'] = this.regexStartWith(from);
    if (reason) match['reason'] = this.regexStartWith(reason);
    if (title) match['title'] = this.regexStartWith(title);
    return match;
  }

  /**
   *
   * @param options Represent the url's query object.
   * @returns {OmitKey<QueryOptionsRes,"match">}  Represent options of find query.
   */
  private createFindOptions(options?: QueryOptions): OmitKey<QueryOptionsRes, 'match'> {
    if (!options) return { page: 1, limit: 20 };

    const { page, limit } = options;
    const pageRes = parseInt(page || '1');
    const limitRes = parseInt(limit || '20');
    return { page: pageRes, limit: limitRes > 50 ? 50 : limitRes };
  }
  /**
   *
   * @param options Represent the url's query object.
   * @returns {QueryOptionsRes} The results of normalize queryOptions.
   */

  private getQueryOptions(options?: QueryOptions): QueryOptionsRes {
    const match = this.createMatchOptions(options);
    const { limit, page } = this.createFindOptions(options);
    return { match, limit, page };
  }

  // private async reduceJobsPostResult(
  //   jobsPostsAgg: AggregationCursor<JobPost>,
  //   filterOptions: QueryOptionsRes
  // ) {
  //   const { limit, page } = filterOptions;
  //   const filterJobsPost = jobsPostsAgg.limit(limit || 20).skip((page - 1) * limit);
  //   return await filterJobsPost.toArray();
  // }

  private transformAggRes(aggRes: JobsPostsResultAgg[]) {
    const res = aggRes[0];
    const pagination = res.pagination[0];
    return { ...res, pagination: pagination };
  }

  /**
   * @param {string} hashQuery that represent the user's query object.
   * @param {QueryOptions} options that represent the url's query object.
   * @returns {Promise<JobPost[]>} All user's jobsPosts that match the user's hashQueries.
   */
  async getJobsByHash(hashQuery: string, options?: QueryOptions): Promise<JobsPostsResultAgg> {
    const { limit, match, page } = this.getQueryOptions(options);

    try {
      const jobsPosts = this.jobsDB?.aggregate<JobsPostsResultAgg>([
        { $match: { hashQueries: { $elemMatch: { $eq: hashQuery } }, ...match } },
        {
          $project: { hashQueries: 0, createdAt: 0, _id: 0 },
        },
        {
          $facet: {
            data: [{ $skip: page }, { $limit: limit }],
            pagination: [{ $count: 'total' }],
          },
        },
      ]);

      // const filterJobsPost = jobsPosts.limit(limit || 20).skip((page - 1) * limit);

      // return await filterJobsPost.toArray();
      const filterJobsPost = await jobsPosts.toArray();
      return filterJobsPost[0];
    } catch (error) {
      return { data: [], pagination: [] };
    }
  }

  /**
   * Gets all the jobsPosts that match the user history queries by their current hashQueries array.
   * @param {string[]} hashQueries  User's HashQueries string array.
   * @param {QueryOptions} options that represent the url's query object.
   * @returns {Promise<JobPost[]>} All user's jobsPosts that match the user's hashQueries array.
   */
  async getJobsByHashQueries(
    hashQueries: string[],
    options?: QueryOptions
  ): Promise<JobsPostsResultAgg> {
    const queryOptions = this.getQueryOptions(options);
    try {
      const jobsPosts = this.jobsDB?.aggregate<JobPost>([
        { $match: { hashQueries: { $elemMatch: { $in: hashQueries } }, ...queryOptions.match } },
        {
          $project: { hashQueries: 0, createdAt: 0, _id: 0 },
        },
        {
          $facet: {
            data: [{ $skip: 10 }, { $limit: 10 }],
            pagination: [{ $count: 'total' }],
          },
        },
      ]);

      const filterJobsPost = await this.reduceJobsPostResult(jobsPosts, queryOptions);
      return filterJobsPost;
    } catch (error) {
      return [];
    }
  }

  async updateOne(jobID: string, hash: string) {
    try {
      const update = await this.jobsDB.updateOne(
        { jobID },
        { $set: { createdAt: new Date() }, $addToSet: { hashQueries: hash } }
      );
      return update.modifiedCount;
    } catch (error) {
      return;
    }
  }
  async insertMany(jobs: JobPost[]) {
    try {
      const insert = await this.jobsDB.insertMany(jobs);
      return insert;
    } catch (error) {
      console.log(error);
    }
  }
}
