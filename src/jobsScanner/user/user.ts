import { Job } from '../../../mongoDB/jobsDB/jobsDB.types';

import { UserQueryProps } from '../generalQuery/query.types';
import {
  ExcludeRequirementsOptions,
  ExperienceRange,
  RequirementsOptions,
  UserProfile,
} from './userEntity.types';

import { UserQuery } from './UserQuery';

/**
 * @param excludedRequirements An object that contains the tech stack which the user doesn't want to include the in jobs list.
 * @param requirements An object that contains the min and max years of experience per each of the user.
 * @param overallEx A number that present the overall experience of the user.
 */
export class User {
  userID: string;
  overallEx?: number;
  requirements: Map<string, ExperienceRange>;
  excludedRequirements: Map<string, boolean>;
  jobsObserved: string[];
  userQueries: UserQueryProps[];
  activeHash?: string;

  constructor(userOptions: UserProfile, activeHash?: string) {
    this.userID = userOptions.userID;
    this.overallEx = userOptions.overallEx;
    this.requirements = this.setRequirements(userOptions.requirements);
    this.excludedRequirements = this.setExcludedRequirements(userOptions.excludedRequirements);
    this.userQueries = this.loadQueryCurSearchQuery(userOptions.userQueries, activeHash);
    this.jobsObserved = userOptions.jobsObserved || [];
    this.activeHash = activeHash || this.getLastHashQuery();
    console.log(' this.activeHash', activeHash, this.getLastQuery());
  }

  /**
   * @param {UserQueryProps[]} userQueriesProps from the DB.
   * @returns {UserQuery[]} an array of userQueries as UserQuery entities.
   */

  static _loadQueriesAsUserQueryEntity(userQueriesProps: UserQueryProps[]): UserQuery[] {
    return userQueriesProps.map((query) => new UserQuery(query));
  }

  /**
   * @param {UserQuery[]} userQueries array of UserQuery entities.
   * @returns {UserQuery[]} an unique array of userQueries as UserQuery[].
   */

  makeAnUniqueQueries(userQueries: UserQuery[], activeHash?: string): UserQuery[] {
    return [
      ...new Map(
        userQueries
          .sort((a, b) => {
            //Move the query with active hash to the end of the userQueries arr.
            if (a.hash === activeHash) return 1;
            if (b.hash === activeHash) return -1;
            return a.getCurQueryTime() - b.getCurQueryTime();
          })
          .map((query) => [query['hash'], query])
      ).values(),
    ];
  }

  _getCurUserUniqueQueries(userQueriesProps: UserQueryProps[], activeHash?: string): UserQuery[] {
    //Convert the user queries from the DB to userQuery array.
    const curUserQueries = User._loadQueriesAsUserQueryEntity(userQueriesProps);

    //Get unique user queries.
    const curUniqueUserQueries = this.makeAnUniqueQueries(curUserQueries, activeHash);

    return curUniqueUserQueries;
  }

  /**
   * @returns {UserQueryProps[]} an array of no expired userQueries as UserQueryProps[] .
   */
  static _loadQueriesAsUserQueryProps(userQueries: UserQuery[]): UserQueryProps[] {
    return userQueries.map((query) => query.getUserQueryProps());
  }

  /**
   * This function is for limit the user's amounts of queries in the DB.
   * @param {UserQueryProps[]} userQueriesProps from the DB.
   * @returns {UserQueryProps[]} Convert back userQuery array from entity to user queries array as same format as the format from the DB.
   */

  loadQueryCurSearchQuery(userQueriesProps: UserQueryProps[], activeHash?: string): UserQueryProps[] {
    //Invalidate the old user queries.
    const curUserQueriesEntity = this._getCurUserUniqueQueries(userQueriesProps, activeHash);
    //Convert back userQuery array from entity to user queries array as same format as the format from the DB.
    const curUserQueriesProps = User._loadQueriesAsUserQueryProps(curUserQueriesEntity);

    return curUserQueriesProps;
  }

  getLastQuery(): UserQueryProps {
    const length = this.userQueries.length;
    return this.userQueries[length - 1];
  }

  getLastQueryNumResults() {
    const lastNumResults = this.getLastQuery().numResultsFound;
    const lastNumMatches = this.getLastQuery().numMatches;
    return { lastNumResults, lastNumMatches };
  }

  getLastHashQuery() {
    return this.getLastQuery().hash;
  }

  checkNumResultsIsSame(jobs: Job[]) {
    const lastNumResults = this.getLastQuery().numResultsFound;

    if (lastNumResults === jobs.length) return true;
  }

  setScannerResultsFoundInLastQuery(numResultsFound: number, numMatches: number) {
    const { lastNumMatches, lastNumResults } = this.getLastQueryNumResults();
    if (lastNumResults !== numResultsFound) this.getLastQuery().numResultsFound = numResultsFound;
    if (lastNumMatches !== numMatches) this.getLastQuery().numMatches = numMatches;
  }

  /**
   *
   * @param {string} hash hash to search.
   * @returns {UserQueryProps | undefined} the userQuery
   */
  getQueryByHash(hash: string): UserQueryProps | undefined {
    return this.userQueries.find((query) => query.hash === hash);
  }

  getAllHashes() {
    return this.userQueries.map((query) => query.hash);
  }

  private setRequirements(requirements: RequirementsOptions) {
    return new Map(Object.entries<ExperienceRange>(requirements));
  }
  private setExcludedRequirements(excludedRequirements: ExcludeRequirementsOptions) {
    return new Map(Object.entries<boolean>(excludedRequirements));
  }

  getRequirement(word: string) {
    return this.requirements.get(word);
  }

  getExcludedRequirement(word: string) {
    return this.excludedRequirements.get(word);
  }
  /**
   * @param {UserQuery[]} userQueries array of UserQuery entities.
   * @returns {UserQuery[]} an array of no expired userQueries as UserQuery[].
   */
}
