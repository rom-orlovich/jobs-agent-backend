import { Collection } from 'mongodb';
import { mongoDB } from '../../src/server';

import { GenericRecord } from '../../lib/types';
import { Job, JobsResultAgg, JobsResults, QueryOptionsRes } from './jobsDB.types';
import { EXPIRE_AT_MONGO_DB } from '../../lib/contestants';

export class JobsDB {
  jobsDB: Collection;
  static DEFAULT_LIMIT = 20;
  static MAX_LIMIT = 50;
  static DEFAULT_PAGE = 1;
  defaultJobAggReturn: JobsResults = {
    jobs: [],
    pagination: { totalPages: 1, totalDocs: 0, hasMore: false, numResultsFound: 0 },
    filters: {
      companies: [],
      from: [],
      locations: [],
      titles: [],
      reasons: [],
    },
    numMatches: 0,
  };

  constructor() {
    this.jobsDB = mongoDB.createDBcollection('jobs-agent-db', 'jobs');
  }

  static getLimit(limit?: number) {
    return limit || JobsDB.DEFAULT_LIMIT;
  }
  static getPage(page?: number) {
    return page || JobsDB.DEFAULT_PAGE;
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

  /**
   * Check whatever there is a num results limit or page number exist, and if it does so
   * limit the number of results from the DB.
   * @param {GenericRecord<RegExp>} match An object of the field to filter and their regex.
   * @param {number} limit A limit the number of the result to get from the DB.
   * @param {number} page A number of the page to display.
   * @returns The facet stage that generate the data.
   */
  private checkFacetPagination(
    match: GenericRecord<RegExp>,
    limit?: number,
    page?: number,
    useQueryOptions = true
  ) {
    const isTherePaginationOpt = limit && page !== undefined;

    //Check if there pagination options like limit and page
    const isSearchByPaginationOpt = isTherePaginationOpt && page >= 0;

    if (match?.reason || !useQueryOptions) return { jobs: [] };
    else
      return isSearchByPaginationOpt
        ? { jobs: [{ $skip: page }, { $limit: limit }, { $match: match }] }
        : { jobs: [{ $match: match }] };
  }
  /**
   * @returns The filters pipeline of the current jobs data.
   */
  private getFacetFiltersPipeline(match?: GenericRecord<RegExp>) {
    if (match?.reason) return {};
    return {
      filters: [
        {
          $group: {
            _id: '_id',
            titles: { $addToSet: '$title' },
            from: { $addToSet: '$from' },
            companies: { $addToSet: '$company' },
            locations: { $addToSet: '$location' },
          },
        },
      ],
    };
  }

  /**
   * @param {GenericRecord<RegExp>} match An object of the field to filter and their regex.
   * @param {number} limit A limit the number of the result to get from the DB.
   * @param {number} page A number of the page to display.
   * @returns An object that represent the facet stage pipelines.
   */
  private getFacetPipelines(
    match: GenericRecord<RegExp>,
    limit?: number,
    page?: number,
    useQueryOptions = true
  ) {
    const { reason, ...resetMatch } = match;
    const facetPaginationData = this.checkFacetPagination(match, limit, page, useQueryOptions);

    const facetFiltersPipeline = this.getFacetFiltersPipeline();
    return {
      ...facetPaginationData,
      ...facetFiltersPipeline,
      pagination: [{ $count: 'totalDocs' }],
      numResultsFound: [{ $match: resetMatch }, { $count: 'numResultsFound' }],
    };
  }
  /**
   *
   * @param {JobsResultAgg[]} aggRes The return array of jobs's aggregation.
   * @returns {JobsResults} The data of the jobs and the totalPages number of documents.
   */
  private convertJobsAggRes(aggRes: JobsResultAgg[], limit: number): JobsResults {
    const res = aggRes[0];
    const numResultsFoundObj = res.numResultsFound[0];

    const pagination = res?.pagination[0];
    const totalDocs = pagination?.totalDocs || 0;

    const totalPages = Math.ceil(totalDocs / limit); // Round up to get the current num page.

    const numResultsFound = numResultsFoundObj?.numResultsFound || 0;
    const hasMore = numResultsFound >= limit;

    const filters = res?.filters.length === 0 ? this.defaultJobAggReturn.filters : res?.filters[0];

    return {
      jobs: res.jobs,
      pagination: {
        totalPages: totalPages,
        totalDocs: pagination?.totalDocs || 0,
        hasMore,
        numResultsFound: numResultsFound,
      },
      filters,
      numMatches: 0,
    };
  }
  /**
   * @param {string} hashQuery that represent the user's query object.
   * @param {QueryOptions} options that represent the url's query object.
   * @returns {Promise<JobsResults>} All user's jobs that match the user's hashQueries.
   */
  async getJobsByHash(
    hashQuery: string,
    queryOptions: QueryOptionsRes,
    useQueryOptions = true
  ): Promise<JobsResults> {
    const { match, limit, page } = queryOptions;
    const { reason, ...restMatch } = match;
    const facetPipelines = this.getFacetPipelines(match, limit, page, useQueryOptions);
    console.log(
      JSON.stringify([
        { $match: { hashQueries: { $elemMatch: { $eq: hashQuery } }, ...restMatch } },
        {
          $project: { hashQueries: 0, createdAt: 0, _id: 0 },
        },
        {
          $facet: facetPipelines,
        },
      ])
    );
    try {
      const jobsAgg = await this.jobsDB
        ?.aggregate<JobsResultAgg>([
          { $match: { hashQueries: { $elemMatch: { $eq: hashQuery } }, ...restMatch } },
          {
            $project: { hashQueries: 0, createdAt: 0, _id: 0 },
          },
          {
            $facet: facetPipelines,
          },
        ])
        .toArray();

      const jobsRes = this.convertJobsAggRes(jobsAgg, limit || JobsDB.DEFAULT_LIMIT);

      return jobsRes;
    } catch (error) {
      console.log(error);
      return this.defaultJobAggReturn;
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
            $facet: facetPipelines,
          },
        ])
        .toArray();

      const jobsRes = this.convertJobsAggRes(jobsAgg, limit || JobsDB.DEFAULT_LIMIT);

      return jobsRes;
    } catch (error) {
      console.log(error);
      return this.defaultJobAggReturn;
    }
  }
}
