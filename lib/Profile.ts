import { ExperienceRange, TechStack, TechStackOptions } from './TechStack';
import { GenericRecord } from './type';

export const STACK: GenericRecord<ExperienceRange> = {
  javascript: { min: 0, max: 3 },
  react: { min: 0, max: 3 },
  typescript: { min: 0, max: 3 },
  ts: { min: 0, max: 3 },
  js: { min: 0, max: 3 },
  'node.js': { min: 0, max: 3 },
  git: { min: 0, max: 3 },
};

interface ProfileOptions {
  techStackOptions: TechStackOptions;
  overallEx: number;
}

export class Profile {
  techStack: InstanceType<typeof TechStack>;
  overallEx: number;
  constructor(profileOptions: ProfileOptions) {
    this.techStack = new TechStack(profileOptions.techStackOptions);
    this.overallEx = profileOptions.overallEx;
  }
}
