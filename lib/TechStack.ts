import { GenericRecord } from './type';

export interface ExperienceRange {
  min: number;
  max: number;
}

export interface TechStackOptions {
  techStack: GenericRecord<ExperienceRange>;
  checkStack?: { disqualifyExcludeTech: boolean };
}
export class TechStack {
  techStack: GenericRecord<ExperienceRange>;
  checkStack?: { disqualifyExcludeTech: boolean };
  constructor(techStackOptions: TechStackOptions) {
    this.techStack = techStackOptions.techStack;
    this.checkStack = techStackOptions.checkStack;
  }

  addStack(tech: string, experience: ExperienceRange) {
    this.techStack[tech] = experience;
  }
  removeStack(tech: string) {
    if (this.techStack[tech]) delete this.techStack[tech];
  }
}
