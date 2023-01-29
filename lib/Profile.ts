import {
  ExperienceRange,
  Requirements,
  RequirementsOptions,
} from './Requirements';
import { GenericRecord } from './types/types';

export const REQUIREMENTS: GenericRecord<ExperienceRange> = {
  javascript: { min: 0, max: 3 },
  react: { min: 0, max: 3 },
  typescript: { min: 0, max: 3 },
  ts: { min: 0, max: 3 },
  js: { min: 0, max: 3 },
  'node.js': { min: 0, max: 3 },
  git: { min: 0, max: 3 },
};

interface ProfileOptions {
  RequirementsOptions: RequirementsOptions;
  overallEx: number;
}

export class Profile {
  Requirements: InstanceType<typeof Requirements>;
  overallEx: number;
  constructor(profileOptions: ProfileOptions) {
    this.Requirements = new Requirements(profileOptions.RequirementsOptions);
    this.overallEx = profileOptions.overallEx;
  }
}

export const profile = new Profile({
  overallEx: 1,
  RequirementsOptions: {
    requirements: REQUIREMENTS,
    excludeTech: { 'C#.NET': false },
  },
});
