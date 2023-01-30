import {
  ExcludeTechsOptions,
  ExperienceRange,
  ProfileOptions,
  RequirementsOptions,
} from './types/profile';
import { GenericRecord } from './types/types';

/**
 * @param excludeTechs An object that contains the tech stack which the user doesn't want to include the in jobs list.
 * @param requirements An object that contains the min and max years of experience per each of the user.
 * @param overallEx A number that present the overall experience of the user.
 */
export class Profile {
  overallEx?: number;
  requirements: Map<string, ExperienceRange>;
  excludeTechs: Map<string, boolean>;

  constructor(profileOptions: ProfileOptions) {
    this.overallEx = profileOptions.overallEx;
    this.requirements = this.setRequirements(profileOptions.requirementsOptions);
    this.excludeTechs = this.setExcludeTechs(profileOptions.excludeTechs);
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
}

export const REQUIREMENTS: GenericRecord<ExperienceRange> = {
  javascript: { min: 0, max: 3 },
  react: { min: 0, max: 3 },
  typescript: { min: 0, max: 3 },
  ts: { min: 0, max: 3 },
  js: { min: 0, max: 3 },
  'node.js': { min: 0, max: 3 },
  git: { min: 0, max: 3 },
};

export const profile = new Profile({
  overallEx: 1,
  requirementsOptions: REQUIREMENTS,
  excludeTechs: { 'C#.NET': false },
});
