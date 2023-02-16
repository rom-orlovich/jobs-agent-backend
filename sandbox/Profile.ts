import { ExcludeTechsOptions, ExperienceRange, UserOptions, RequirementsOptions } from './profile';

import { HashQuery } from './HashQuery';
import { UserQuery } from '../src/GeneralQuery/generalQuery';
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
  hashQueries: InstanceType<typeof HashQuery>[];
  userQuery: UserQuery;

  constructor(userOptions: UserOptions) {
    this.userID = userOptions._id;
    this.overallEx = userOptions.overallEx;
    this.requirements = this.setRequirements(userOptions.requirementsOptions);
    this.excludeTechs = this.setExcludeTechs(userOptions.excludeTechs);
    this.blackList = userOptions.blackList;
    this.hashQueries = [];
    this.userQuery = userOptions.userQuery;
  }

  private setRequirements(requirementsOptions: RequirementsOptions) {
    return new Map(Object.entries<ExperienceRange>(requirementsOptions));
  }

  getRequirement(tech: string) {
    return this.requirements.get(tech);
  }

  addRequirement(tech: string, experience: ExperienceRange) {
    this.requirements.set(tech, experience);
  }
  removeRequirement(tech: string) {
    this.requirements.delete(tech);
  }

  private setExcludeTechs(excludeTechs: ExcludeTechsOptions) {
    return new Map(Object.entries<boolean>(excludeTechs));
  }
  addExcludeTechs(tech: string, experience: boolean) {
    this.excludeTechs.set(tech, experience);
  }

  getExcludeTech(tech: string) {
    return this.excludeTechs.get(tech);
  }

  removeExcludeTech(tech: string) {
    this.requirements.delete(tech);
  }
  static checkIfWordIsWithSlash<ValueMap>(word: string, mapCheck: Map<string, ValueMap>) {
    const wordSplit = word.split('/');
    if (!wordSplit.length) return;

    const findTech = wordSplit.find((w) => mapCheck.get(w));
    return findTech;
  }
  checkRequirementWithSlash(tech: string) {
    return User.checkIfWordIsWithSlash<ExperienceRange>(tech, this.requirements);
  }
  checkExcludedTechWithSlash(tech: string) {
    return User.checkIfWordIsWithSlash<boolean>(tech, this.excludeTechs);
  }

  checkWordInBlackList(word: string) {
    return (
      this.blackList.length &&
      this.blackList.some((bl) => {
        return word.toLowerCase().includes(bl.toLowerCase());
      })
    );
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
