import { HashQuery } from './hashQuery';
import { UserQuery } from '../generalQuery/query';
import {
  ExcludeTechsOptions,
  ExperienceRange,
  HashQueryEntity,
  RequirementsOptions,
  UserOptions,
} from './userEntity';
import { GeneralQuery } from '../generalQuery/generalQuery';

/**
 * @param excludeTechs An object that contains the tech stack which the user doesn't want to include the in jobs list.
 * @param requirements An object that contains the min and max years of experience per each of the user.
 * @param overallEx A number that present the overall experience of the user.
 */
export class User {
  userID: string;
  overallEx?: number;
  requirements: Map<string, ExperienceRange>;
  excludeTechs: Map<string, boolean>;
  blackList: string[];
  hashQueries: HashQueryEntity[];
  userQuery: UserQuery;

  constructor(userOptions: UserOptions) {
    this.userID = userOptions._id;
    this.overallEx = userOptions.overallEx;
    this.requirements = this.setRequirements(userOptions.requirementsOptions);
    this.excludeTechs = this.setExcludeTechs(userOptions.excludeTechs);
    this.blackList = userOptions.blackList;
    this.userQuery = userOptions.userQuery;
    this.hashQueries = userOptions.hashQueries;
    this.filterExpiredHashQueries();
    this.addCurrentHashQuery();
  }

  private setRequirements(requirementsOptions: RequirementsOptions) {
    return new Map(Object.entries<ExperienceRange>(requirementsOptions));
  }
  private setExcludeTechs(excludeTechs: ExcludeTechsOptions) {
    return new Map(Object.entries<boolean>(excludeTechs));
  }

  getRequirement(tech: string) {
    return this.requirements.get(tech);
  }

  getExcludeTech(tech: string) {
    return this.excludeTechs.get(tech);
  }

  checkWordInBlackList(word: string) {
    return (
      this.blackList.length &&
      this.blackList.some((bl) => {
        return word.toLowerCase().includes(bl.toLowerCase());
      })
    );
  }
  isUserQueryActive() {
    return this.userQuery.active;
  }

  getCurrentHashQuery() {
    return GeneralQuery.hashQuery(this.userQuery);
  }

  addCurrentHashQuery() {
    const hash = this.getCurrentHashQuery();
    this.addHashQuery(hash);
  }

  getCurrentHashQueries() {
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

// private setExcludeTechs(excludeTechs: ExcludeTechsOptions) {
//   return new Map(Object.entries<boolean>(excludeTechs));
// }
// addExcludeTechs(tech: string, experience: boolean) {
//   this.excludeTechs.set(tech, experience);
// }

// removeExcludeTech(tech: string) {
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
//   return User.checkIfWordIsWithSlash<boolean>(tech, this.excludeTechs);
// }

 */
