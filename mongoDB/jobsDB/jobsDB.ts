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

  /**
   * Check whatever there is a num results limit or page number exist, and if it does so
   * limit the number of results from the DB.
   * @param {GenericRecord<RegExp>} match An object of the field to filter and their regex.
   * @param {number} limit A limit the number of the result to get from the DB.
   * @param {number} page A number of the page to display.
   * @returns The facet stage that generate the data.
   */
  private checkFacetPagination(match?: GenericRecord<RegExp>, limit?: number, page?: number) {
    return limit && page !== undefined && page >= 0
      ? { jobs: [{ $skip: page }, { $limit: limit }, { $match: match }] }
      : { jobs: [{ $match: match }] };
  }

  /**
   * @param {GenericRecord<RegExp>} match An object of the field to filter and their regex.
   * @param {number} limit A limit the number of the result to get from the DB.
   * @param {number} page A number of the page to display.
   * @returns An object that represent the facet stage pipelines.
   */
  private getFacetPipelines(match?: GenericRecord<RegExp>, limit?: number, page?: number) {
    const facetPaginationData = this.checkFacetPagination(match, limit, page);

    return {
      ...facetPaginationData,
      pagination: [{ $count: 'totalDocs' }],
      numResultsFound: [{ $match: match }, { $count: 'numResultsFound' }],
    };
  }

  /**
   *
   * @param {JobsResultAgg[]} aggRes The return array of jobs's aggregation.
   * @returns {JobsResults} The data of the jobs and the totalPages number of documents.
   */
  private convertJobsAggRes(aggRes: JobsResultAgg[], limit: number, page: number): JobsResults {
    const res = aggRes[0];

    const numResultsFound = res.numResultsFound[0];

    const pagination = res.pagination[0];
    const totalPages = Math.ceil(pagination.totalDocs / limit);

    const hasMore = numResultsFound.numResultsFound <= limit;

    return {
      ...res,
      pagination: {
        totalPages: totalPages,
        totalDocs: pagination.totalDocs,
        hasMore,
        numResultsFound: numResultsFound.numResultsFound,
      },
    };
  }

  /**
   * @param {string} hashQuery that represent the user's query object.
   * @param {QueryOptions} options that represent the url's query object.
   * @returns {Promise<JobsResults>} All user's jobs that match the user's hashQueries.
   */
  async getJobsByHash(hashQuery: string, queryOptions: QueryOptionsRes): Promise<JobsResults> {
    const { match, limit, page } = queryOptions;
    const { reason, ...restMatch } = match;
    const facetPipelines = this.getFacetPipelines(restMatch, limit, page);

    try {
      const jobsAgg = await this.jobsDB
        ?.aggregate<JobsResultAgg>([
          { $match: { hashQueries: { $elemMatch: { $eq: hashQuery } }, ...restMatch } },
          {
            $project: { hashQueries: 0, createdAt: 0, _id: 0 },
          },
          {
            $facet: {
              ...facetPipelines,
              pagination: [{ $count: 'totalDocs' }],
              numMatchResult: [{ $match: restMatch }, { $count: 'numMatchResult' }],
            },
          },
        ])
        .toArray();

      const jobsRes = this.convertJobsAggRes(jobsAgg, limit || 20, page || 1);

      return jobsRes;
    } catch (error) {
      console.log(error);
      return {
        jobs: [],
        pagination: { totalPages: 1, totalDocs: 0, hasMore: false, numResultsFound: 0 },
      };
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
    const { reason, ...restMatch } = match;
    const facetPipelines = this.getFacetPipelines(restMatch, limit, page);

    try {
      const jobsAgg = await this.jobsDB
        ?.aggregate<JobsResultAgg>([
          { $match: { hashQueries: { $elemMatch: { $in: hashQueries } }, ...restMatch } },
          {
            $project: { hashQueries: 0, createdAt: 0, _id: 0 },
          },
          {
            $facet: {
              ...facetPipelines,
              pagination: [{ $count: 'totalDocs' }],
            },
          },
        ])
        .toArray();

      const jobsRes = this.convertJobsAggRes(jobsAgg, limit || 20, page || 1);

      return jobsRes;
    } catch (error) {
      console.log(error);
      return {
        jobs: [],
        pagination: { totalPages: 1, totalDocs: 0, hasMore: false, numResultsFound: 0 },
      };
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
