export interface ExperienceRange {
  min: number;
  max: number;
}

export type RequirementsOptions = GenericRecord<ExperienceRange>;
export type ExcludeTechsOptions = GenericRecord<boolean>;

interface HashQueryProps {
  hash: string;
  addedAt: Date;
  expireAt: number;
}

interface UserOptions {
  _id: string;
  overallEx?: number;
  requirementsOptions: RequirementsOptions;
  excludeTechs: ExcludeTechsOptions;
  blackList: string[];
}
