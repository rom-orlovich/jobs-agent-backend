import { GenericRecord } from './type';

export interface ExperienceRange {
  min: number;
  max: number;
}

export interface TechStackOptions {
  techStack: GenericRecord<ExperienceRange>;
  excludeTech?: GenericRecord<boolean>;
}
export class TechStack {
  techStack: TechStackOptions['techStack'];
  excludeTech?: TechStackOptions['excludeTech'];
  constructor(techStackOptions: TechStackOptions) {
    this.techStack = techStackOptions.techStack;
    this.excludeTech = techStackOptions.excludeTech;
  }

  addStack(tech: string, experience: ExperienceRange) {
    this.techStack[tech] = experience;
  }
  removeStack(tech: string) {
    if (this.techStack[tech]) delete this.techStack[tech];
  }
}
