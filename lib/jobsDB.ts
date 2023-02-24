import { Collection } from 'mongodb';
import { mongoDB } from '../src/server';
import { Job, JobPost } from '../src/jobsScanner/jobsScanner.types';
import { EXPIRE_AT_MONGO_DB } from '../src/jobsScanner/user/UserQuery';
import { GenericRecord, OmitKey } from './types';

export interface FilterOptions {
  title?: string;
  reason?: string;
  from?: string;
  page?: string;
  limit?: string;
}

export interface FilterOptionsRes {
  match: GenericRecord<RegExp>;
  page: number;
  limit: number;
}

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
  private createMatchOptions(options?: FilterOptions): GenericRecord<RegExp> {
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
   * @returns {OmitKey<FilterOptionsRes,"match">}  Represent options of find query.
   */
  private createFindOptions(options?: FilterOptions): OmitKey<FilterOptionsRes, 'match'> {
    if (!options) return { page: 1, limit: 20 };

    const { page, limit } = options;
    return { page: parseInt(page || '1'), limit: parseInt(limit || '20') };
  }
  /**
   *
   * @param options Represent the url's query object.
   * @returns {FilterOptionsRes} The results of normalize queryOptions.
   */

  private getQueryOptions(options?: FilterOptions): FilterOptionsRes {
    const match = this.createMatchOptions(options);
    const { limit, page } = this.createFindOptions(options);
    return { match, limit, page };
  }

  /**
   * @param {string} hashQuery that represent the user's query object.
   * @param {FilterOptions} options that represent the url's query object.
   * @returns {Promise<JobPost[]>} All user's jobsPosts that match the user's hashQueries.
   */
  async getJobsByHash(hashQuery: string, options?: FilterOptions): Promise<JobPost[]> {
    const { match, limit, page } = this.getQueryOptions(options);

    try {
      const jobsPosts = this.jobsDB
        ?.aggregate<JobPost>([
          { $match: { hashQueries: { $elemMatch: { $eq: hashQuery } }, ...match } },
          {
            $project: { hashQueries: 0, createdAt: 0, _id: 0 },
          },
        ])
        .limit(limit || 20)
        .skip((page - 1) * limit);

      return await jobsPosts.toArray();
    } catch (error) {
      return [];
    }
  }

  /**
   * Gets all the jobsPosts that match the user history queries by their current hashQueries array.
   * @param {string[]} hashQueries  User's HashQueries string array.
   * @param {FilterOptions} options that represent the url's query object.
   * @returns {Promise<JobPost[]>} All user's jobsPosts that match the user's hashQueries array.
   */
  async getJobsByHashQueries(hashQueries: string[], options?: FilterOptions): Promise<JobPost[]> {
    const { match, limit, page } = this.getQueryOptions(options);
    try {
      const job = this.jobsDB
        ?.aggregate<JobPost>([
          { $match: { hashQueries: { $elemMatch: { $in: hashQueries } }, ...match } },
          {
            $project: { hashQueries: 0, createdAt: 0, _id: 0 },
          },
        ])
        .limit(limit || 20)
        .skip((page - 1) * limit);

      return await job.toArray();
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
