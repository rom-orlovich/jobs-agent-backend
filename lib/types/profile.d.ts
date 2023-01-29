export interface ExperienceRange {
  min: number;
  max: number;
}

export type RequirementsOptions = GenericRecord<ExperienceRange>;
export type ExcludeTechsOptions = GenericRecord<boolean>;

interface ProfileOptions {
  overallEx: number;
  requirementsOptions: RequirementsOptions;
  excludeTechs: ExcludeTechsOptions;
}
