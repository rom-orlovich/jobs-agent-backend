import { GenericRecord } from './types/types';

export interface ExperienceRange {
  min: number;
  max: number;
}

export interface RequirementsOptions {
  requirements: GenericRecord<ExperienceRange>;
  excludeTech?: GenericRecord<boolean>;
}
export class Requirements {
  requirements: RequirementsOptions['requirements'];
  excludeTech?: RequirementsOptions['excludeTech'];
  constructor(RequirementsOptions: RequirementsOptions) {
    this.requirements = RequirementsOptions.requirements;
    this.excludeTech = RequirementsOptions.excludeTech;
  }

  addStack(tech: string, experience: ExperienceRange) {
    this.requirements[tech] = experience;
  }
  removeStack(tech: string) {
    if (this.requirements[tech]) delete this.requirements[tech];
  }
}
