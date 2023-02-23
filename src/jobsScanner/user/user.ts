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
   * @returns an array of no expired userQueries.
   */
  loadQueryCurSearchQuery(userQueriesProps: UserQueryProps[]) {
    const curUserQueries = userQueriesProps.map((query) => new UserQuery(query));
    //Filter the old userQueries.
    const curFilterUserQueries = curUserQueries.filter((query) => !query.isUserQueryExpire());
    const curUserQueriesProps = curFilterUserQueries.map((query) => query.getUserQueryProps());
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
