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

  private convertFacetToPipeline(limit?: number, page?: number) {
    return limit && page !== undefined && page >= 0
      ? { jobs: [{ $skip: page }, { $limit: limit }] }
      : { jobs: [] };
  }

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

    const $facetData = this.convertFacetToPipeline(limit, page);

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
    const $facetData = this.convertFacetToPipeline(limit, page);

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
