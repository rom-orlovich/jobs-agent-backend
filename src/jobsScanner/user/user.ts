import { HashQuery } from './hashQuery';
import { UserQuery } from '../generalQuery/query';
import {
  ExcludeRequirementsOptions,
  ExperienceRange,
  HashQueryEntity,
  RequirementsOptions,
  UserOptions,
} from './userEntity';
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
  blackList: string[];
  hashQueries: HashQueryEntity[];
  userQuery: UserQuery;

  constructor(userOptions: UserOptions) {
    this.userID = userOptions._id;
    this.overallEx = userOptions.overallEx;
    this.requirements = this.setRequirements(userOptions.requirements);
    this.excludedRequirements = this.setExcludedRequirements(userOptions.excludedRequirements);
    this.blackList = userOptions.blackList;
    this.userQuery = userOptions.userQuery;
    this.hashQueries = userOptions?.hashQueries || [];
    this.filterExpiredHashQueries();
    this.addCurrentHashQuery();
  }

  private setRequirements(requirementsOptions: RequirementsOptions) {
    return new Map(Object.entries<ExperienceRange>(requirementsOptions));
  }
  private setExcludedRequirements(excludedRequirements: ExcludeRequirementsOptions) {
    return new Map(Object.entries<boolean>(excludedRequirements));
  }

  getRequirement(tech: string) {
    return this.requirements.get(tech);
  }

  getExcludedRequirement(tech: string) {
    return this.excludedRequirements.get(tech);
  }

  checkWordInBlackList(word: string) {
    return (
      this.blackList?.length &&
      this.blackList?.some((bl) => {
        return word.toLowerCase().includes(bl.toLowerCase());
      })
    );
  }
  isUserQueryActive() {
    return this.userQuery.active;
  }

  /**
   * @returns The current user's hashQuery.
   */
  getCurrentHashQuery(): string {
    return GeneralQuery.hashQuery(this.userQuery);
  }

  addCurrentHashQuery() {
    const hash = this.getCurrentHashQuery();
    this.addHashQuery(hash);
  }

  /**
   * @returns {string[]} The current user's hashQueries array.
   */
  getCurrentHashQueries(): string[] {
    return this.hashQueries.map((el) => el.hash);
  }

  addHashQuery(hash: string) {
    this.hashQueries.push(new HashQuery(hash));
  }
  updateHashAddedAt(hash: string) {
    const hashQuery = this.hashQueries.find((hashQuery) => hashQuery.hash === hash);
    if (hashQuery) hashQuery.updateHashAddedAt();
  }
  filterExpiredHashQueries() {
    this.hashQueries = this.hashQueries.filter((hashQuery) => !hashQuery.isHashExpire());
  }
}
/**
 * // addRequirement(tech: string, experience: ExperienceRange) {
//   this.requirements.set(tech, experience);
// }
// removeRequirement(tech: string) {
//   this.requirements.delete(tech);
// }

// private setExcludedRequirements(excludedRequirements: ExcludeRequirementsOptions) {
//   return new Map(Object.entries<boolean>(excludedRequirements));
// }
// addExcludeRequirements(tech: string, experience: boolean) {
//   this.excludedRequirements.set(tech, experience);
// }

// removeExcludeRequirement(tech: string) {
//   this.requirements.delete(tech);
// }
// static checkIfWordIsWithSlash<ValueMap>(word: string, mapCheck: Map<string, ValueMap>) {
//   const wordSplit = word.split('/');
//   if (!wordSplit.length) return;

//   const findTech = wordSplit.find((w) => mapCheck.get(w));
//   return findTech;
// }
// checkRequirementWithSlash(tech: string) {
//   return User.checkIfWordIsWithSlash<ExperienceRange>(tech, this.requirements);
// }
// checkExcludedTechWithSlash(tech: string) {
//   return User.checkIfWordIsWithSlash<boolean>(tech, this.excludedRequirements);
// }

 */
