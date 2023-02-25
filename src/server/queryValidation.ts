import { GenericRecord, OmitKey } from '../../lib/types';
export interface QueryOptions {
  title?: string;
  reason?: string;
  from?: string;
  page?: string;
  limit?: string;
}

export interface QueryOptionsRes {
  match: GenericRecord<RegExp>;
  page?: number;
  limit?: number;
}
export class QueryValidation {
  possiblesKeys: GenericRecord<boolean> = {
    hash: true,
    title: true,
    from: true,
    reason: true,
    limit: true,
    page: true,
  };
  preQueryOptions: GenericRecord<any> | undefined;
  resultQueryOptions: QueryOptionsRes | undefined;
  constructor(queryOptions?: GenericRecord<any>) {
    this.preQueryOptions = queryOptions;
    this.resultQueryOptions = this.getQueryOptions();
  }

  static checkString(str: unknown) {
    if (typeof str === 'string') return str;
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

  private regexStartWith(str: string) {
    return new RegExp(`^${str}`, 'i');
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
  private createFacetOptions(options?: QueryOptions): OmitKey<QueryOptionsRes, 'match'> {
    if (!options) return { page: 1, limit: 20 };

    const { page, limit } = options;
    const pageInt = parseInt(page || '1');
    const limitRes = parseInt(limit || '20');
    const pageRes = (pageInt - 1) * limitRes;
    return { page: pageRes, limit: limitRes > 50 ? 50 : limitRes };
  }

  /**
   * @param options Represent the url's query object.
   * @returns {QueryOptionsRes} The results of normalize queryOptions.
   */

  private getQueryOptions(): QueryOptionsRes | undefined {
    console.log(this.preQueryOptions);
    //Return queryOptions default values.
    if (!this.preQueryOptions) return { match: {}, limit: 20, page: 1 };

    // Check if the query is valid.
    if (!this.checkValidQuery(this.preQueryOptions)) return undefined;

    // Return match object pipeline.
    const match = this.createMatchOptions(this.preQueryOptions);

    //Return queryOptions without limit and page and match.
    if (!this.preQueryOptions.hash) return { match: match, limit: undefined, page: undefined };

    // Return facet object pipeline.
    const { limit, page } = this.createFacetOptions(this.preQueryOptions);
    return { match, limit, page };
  }
}
