// import { HashQuery } from './hashQuery';
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

  userQueries: UserQueryProps[];

  constructor(userOptions: UserProfile) {
    this.userID = userOptions.userID;
    this.overallEx = userOptions.overallEx;
    this.requirements = this.setRequirements(userOptions.requirements);
    this.excludedRequirements = this.setExcludedRequirements(userOptions.excludedRequirements);
    this.userQueries = this.loadQueryCurSearchQuery(userOptions.userQueries);
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
   * @returns {UserQuery[]} an array of no expired userQueries as UserQuery[].
   */

  static _filterQueriesAsUserQueryEntity(userQueries: UserQuery[]): UserQuery[] {
    return userQueries.filter((query) => !query.isUserQueryExpire());
  }

  /**
   * @param {UserQueryProps[]} userQueriesProps from the DB.
   * @returns {UserQuery[]} an array of no expired userQueries as UserQuery[].
   */

  static _invalidateCurUserQueries(userQueriesProps: UserQueryProps[]): UserQuery[] {
    //Convert the user queries from the DB to userQuery array.
    const curUserQueries = User._loadQueriesAsUserQueryEntity(userQueriesProps);

    //Filter the old userQueries.
    const curFilterUserQueries = User._filterQueriesAsUserQueryEntity(curUserQueries);

    return curFilterUserQueries;
  }

  /**
   * @param {UserQuery[]} userQueriesProps  array of UserQuery entities.
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

  loadQueryCurSearchQuery(userQueriesProps: UserQueryProps[]): UserQueryProps[] {
    //Invalidate the old user queries.
    const curFilterUserQueries = User._invalidateCurUserQueries(userQueriesProps);
    //Convert back userQuery array from entity to user queries array as same format as the format from the DB.
    const curUserQueriesProps = User._loadQueriesAsUserQueryProps(curFilterUserQueries);
    return curUserQueriesProps;
  }

  getLastQuery() {
    const length = this.userQueries.length;
    return this.userQueries[length - 1];
  }

  getLastHashQuery() {
    return this.getLastQuery().hash;
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
}
