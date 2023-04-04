import { GenericRecord, OmitKey } from '../../../lib/types';
import { JobsDB } from '../../../mongoDB/jobsDB/jobsDB';
export interface QueryOptions {
  title?: string;
  reason?: string;
  from?: string;
  company?: string;
  location?: string;
  page?: string;
  limit?: string;
}

export interface QueryOptionsRes {
  match: GenericRecord<RegExp>;
  page?: number;
  limit?: number;
  jobObserved?: boolean;
}
export class QueryValidation {
  possiblesKeys: GenericRecord<boolean> = {
    hash: true,
    title: true,
    reason: true,
    from: true,
    company: true,
    location: true,
    limit: true,
    page: true,
    jobObserved: true,
  };
  preQueryOptions: GenericRecord<any> | undefined;
  resultQueryOptions: QueryOptionsRes | undefined;
  constructor(queryOptions?: GenericRecord<any>) {
    this.preQueryOptions = queryOptions;
    this.resultQueryOptions = this.getQueryOptions();
  }

  static QueryEmpty<T extends GenericRecord<any>>(obj: T) {
    return !Object.keys(obj).length;
  }

  static checkString(str: unknown) {
    if (typeof str === 'string') return str.replace(/!@#$%^&*()_+\\-=\[\]{};':"\\|,<>\/?~/g, '');
  }
  static checkValidNumber(num: unknown) {
    const isValidStr = QueryValidation.checkString(num);
    if (!isValidStr) return undefined;
    const numParse = Number.parseInt(isValidStr);
    if (!Number.isFinite(numParse)) return undefined;

    return numParse;
  }

  //Check query has valid query key value
  private checkValidQuery(query: GenericRecord<any>) {
    console.log('query', query);
    //Helpers functions that check if query keyValue is valid input.
    //Key is valid if it exist in possibleKeys object and if it valid string or valid number.
    const checkValidKeyValue = (key: string) =>
      this.possiblesKeys[key] &&
      (QueryValidation.checkString(key) || QueryValidation.checkValidNumber(key));

    const queryKeysArr = Object.keys(query);
    //Check forEach query keys if it valid key.
    const checkValidQueryKey = queryKeysArr.some((key) => !checkValidKeyValue(key));
    if (checkValidQueryKey) return false;

    return true;
  }

  private regexStartWith(str: string, prefix: 'start' | 'contains' = 'contains') {
    let strReg = `${str}`;
    if (prefix === 'start') strReg = `^${str}`;
    return new RegExp(strReg, 'i');
  }

  /**
   * @param {JobsQueryOptions} options How the user wants to filter the data.
   * @returns {GenericRecord<RegExp>} The match object. The keys are the fields the user wants to filter
   * by them and the values are regex.
   */
  private createMatchOptions(options?: QueryOptions): GenericRecord<RegExp> {
    if (!options) return {};
    const match: GenericRecord<RegExp> = {};
    const { from, reason, title, company, location } = options;
    if (title) match['title'] = this.regexStartWith(title);
    if (reason) match['reason'] = this.regexStartWith(reason);
    if (from) match['from'] = this.regexStartWith(from);
    if (company) match['company'] = this.regexStartWith(company);
    if (location) match['location'] = this.regexStartWith(location);
    return match;
  }

  /**
   *
   * @param options Represent the url's query object.
   * @returns {OmitKey<QueryOptionsRes,"match">}  Represent options of find query.
   */
  private createFacetOptions(options?: QueryOptions): OmitKey<QueryOptionsRes, 'match'> {
    if (!options) return { limit: JobsDB.DEFAULT_LIMIT, page: JobsDB.DEFAULT_PAGE };

    const { page, limit } = options;
    const pageInt = parseInt(page || `${JobsDB.DEFAULT_PAGE}`);
    const limitRes = parseInt(limit || `${JobsDB.DEFAULT_LIMIT}`);
    const pageRes = (pageInt - 1) * limitRes;
    return { page: pageRes, limit: limitRes > JobsDB.MAX_LIMIT ? JobsDB.MAX_LIMIT : limitRes };
  }

  /**
   * @param options Represent the url's query object.
   * @returns {QueryOptionsRes} The results of normalize queryOptions.
   */

  private getQueryOptions(): QueryOptionsRes | undefined {
    //Return queryOptions default values.
    if (!this.preQueryOptions)
      return {
        match: {},
        limit: JobsDB.DEFAULT_LIMIT,
        page: JobsDB.DEFAULT_PAGE,
        jobObserved: undefined,
      };

    // Check if the query is valid.
    if (!this.checkValidQuery(this.preQueryOptions)) return undefined;

    // Return match object pipeline.
    const match = this.createMatchOptions(this.preQueryOptions);

    //Return queryOptions without limit and page and match.
    if (!this.preQueryOptions.hash)
      return { match: match, limit: undefined, page: undefined, jobObserved: undefined };

    //Get the jobs observed value.
    const jobObserved =
      this.preQueryOptions.jobObserved === undefined
        ? undefined
        : this.preQueryOptions.jobObserved === 'true';

    console.log(jobObserved);

    // Return facet object pipeline.
    const { limit, page } = this.createFacetOptions(this.preQueryOptions);
    return { match, limit, page, jobObserved };
  }
}
