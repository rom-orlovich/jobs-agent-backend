import { Collection } from 'mongodb';
import { mongoDB } from '../../src/server';

import { EXPIRE_AT_MONGO_DB } from '../../src/jobsScanner/user/UserQuery';
import { GenericRecord, OmitKey } from '../../lib/types';
import { Job, JobsResultAgg, JobsResults, QueryOptions, QueryOptionsRes } from './jobsDB.types';

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

  // private regexStartWith(str: string) {
  //   return new RegExp(`^${str}`);
  // }

  // /**
  //  * @param {JobsQueryOptions} options How the user wants to filter the data.
  //  * @returns {GenericRecord<RegExp>} The match object. The keys are the fields the user wants to filter
  //  * by them and the values are regex.
  //  */
  // private createMatchOptions(options?: QueryOptions): GenericRecord<RegExp> {
  //   if (!options) return {};
  //   const match: GenericRecord<RegExp> = {};
  //   const { from, reason, title } = options;
  //   if (from) match['from'] = this.regexStartWith(from);
  //   if (reason) match['reason'] = this.regexStartWith(reason);
  //   if (title) match['title'] = this.regexStartWith(title);
  //   return match;
  // }

  // /**
  //  *
  //  * @param options Represent the url's query object.
  //  * @returns {OmitKey<QueryOptionsRes,"match">}  Represent options of find query.
  //  */
  // private createFacetOptions(options?: QueryOptions): OmitKey<QueryOptionsRes, 'match'> {
  //   if (!options) return { page: 1, limit: 20 };
  //   const { page, limit } = options;
  //   const pageInt = parseInt(page || '1');
  //   const limitRes = parseInt(limit || '20');
  //   const pageRes = (pageInt - 1) * limitRes;
  //   return { page: pageRes, limit: limitRes > 50 ? 50 : limitRes };
  // }
  // /**
  //  * @param options Represent the url's query object.
  //  * @returns {QueryOptionsRes} The results of normalize queryOptions.
  //  */

  // private getQueryOptions(options?: QueryOptions, activeOptions = true): QueryOptionsRes {
  //   if (activeOptions) return { match: {}, limit: undefined, page: undefined };
  //   const match = this.createMatchOptions(options);
  //   const { limit, page } = this.createFacetOptions(options);
  //   return { match, limit, page };
  // }

  /**
   *
   * @param {JobsResultAgg[]} aggRes The return array of jobs's aggregation.
   * @returns {JobsResults} The data of the jobs and the total number of documents.
   */
  private convertJobsAggRes(aggRes: JobsResultAgg[]): JobsResults {
    const res = aggRes[0];
    const pagination = res.pagination[0];
    return { ...res, pagination: pagination };
  }

  /**
   * @param {string} hashQuery that represent the user's query object.
   * @param {QueryOptions} options that represent the url's query object.
   * @returns {Promise<JobsResults>} All user's jobs that match the user's hashQueries.
   */
  async getJobsByHash(hashQuery: string, queryOptions: QueryOptionsRes): Promise<JobsResults> {
    const { match, limit, page } = queryOptions;
    const $facetData = limit && page ? { data: [{ $skip: page }, { $limit: limit }] } : { data: [] };

    try {
      const jobsAgg = await this.jobsDB
        ?.aggregate<JobsResultAgg>([
          { $match: { hashQueries: { $elemMatch: { $eq: hashQuery } }, ...match } },
          {
            $project: { hashQueries: 0, createdAt: 0, _id: 0 },
          },
          {
            $facet: {
              ...$facetData,
              pagination: [{ $count: 'total' }],
            },
          },
        ])
        .toArray();

      const jobsRes = this.convertJobsAggRes(jobsAgg);
      return jobsRes;
    } catch (error) {
      return { jobs: [], pagination: { total: 0 } };
    }
  }

  /**
   * Gets all the jobs that match the user history queries by their current hashQueries array.
   * @param {string[]} hashQueries  User's HashQueries string array.
   * @param {QueryOptions} options that represent the url's query object.
   * @returns {Promise<Job[]>} All user's jobs that match the user's hashQueries array.
   */
  async getJobsByHashQueries(
    hashQueries: string[],
    queryOptions: QueryOptionsRes
  ): Promise<JobsResults> {
    const { match, limit, page } = queryOptions;
    const $facetData = limit && page ? { jobs: [{ $skip: page }, { $limit: limit }] } : { jobs: [] };
    // console.log($facetData, { $match: { hashQueries: { $elemMatch: { $in: hashQueries } }, ...match } });
    try {
      const jobsAgg = await this.jobsDB
        ?.aggregate<JobsResultAgg>([
          { $match: { hashQueries: { $elemMatch: { $in: hashQueries } }, ...match } },
          {
            $project: { hashQueries: 0, createdAt: 0, _id: 0 },
          },
          {
            $facet: {
              ...$facetData,
              pagination: [{ $count: 'total' }],
            },
          },
        ])
        .toArray();

      const jobsRes = this.convertJobsAggRes(jobsAgg);
      return jobsRes;
    } catch (error) {
      return { jobs: [], pagination: { total: 0 } };
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
  async insertMany(jobs: Job[]) {
    try {
      const insert = await this.jobsDB.insertMany(jobs);
      return insert;
    } catch (error) {
      console.log(error);
    }
  }
}
