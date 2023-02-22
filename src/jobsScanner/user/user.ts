import { HashQuery } from './hashQuery';
import { UserQuery } from '../generalQuery/query.types';
import {
  ExcludeRequirementsOptions,
  ExperienceRange,
  HashQueryEntity,
  RequirementsOptions,
  UserOptions,
} from './userEntity.types';
import { GeneralQuery } from '../generalQuery/generalQuery';

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

  hashQueries: HashQueryEntity[];
  userQuery: UserQuery;

  constructor(userOptions: UserOptions) {
    this.userID = userOptions._id;
    this.overallEx = userOptions.overallEx;
    this.requirements = this.setRequirements(userOptions.requirements);
    this.excludedRequirements = this.setExcludedRequirements(userOptions.excludedRequirements);

    this.userQuery = userOptions.userQuery;
    this.hashQueries = userOptions?.hashQueries || [];
    this.loadCurrentHashQuery();
    this.addCurrentHashQuery();
  }

  private filterExpiredHashQueries() {
    this.hashQueries = this.hashQueries.filter((hashQuery) => !hashQuery.isHashExpire());
  }

  /**
   * Load the current user's hashQueries from the DB to hash query instance.
   */
  private loadCurrentHashQuery() {
    this.hashQueries = this.hashQueries.map((el) => new HashQuery(el.hash, el.createdAt));
    this.filterExpiredHashQueries();
    this.addCurrentHashQuery();
  }

  /**
   * @returns The current user's hashQuery.
   */
  getCurrentHashQuery(): string {
    return GeneralQuery.hashQuery(this.userQuery);
  }

  addHashQuery(hash: string) {
    this.hashQueries.push(new HashQuery(hash));
  }

  private addCurrentHashQuery() {
    const hash = this.getCurrentHashQuery();
    const hashQuery = this.hashQueries.find((hashQuery) => hashQuery.hash === hash);
    if (!hashQuery) this.addHashQuery(hash);
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
   * @returns {string[]} The current user's hashQueries array.
   */
  getCurrentHashQueries(): string[] {
    return this.hashQueries.map((el) => el.hash);
  }

  updateHashCreatedAt(hash: string) {
    const hashQuery = this.hashQueries.find((hashQuery) => hashQuery.hash === hash);
    if (hashQuery) hashQuery.updateHashCreatedAt();
  }

  isUserQueryActive() {
    return this.userQuery.active;
  }
}
