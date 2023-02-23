import { GenericRecord } from '../../../lib/types';
import { UserQueryProps } from '../generalQuery/query.types';

import { User } from './user';

export interface ExperienceRange {
  min: number;
  max: number;
}

export type RequirementsOptions = GenericRecord<ExperienceRange>;
export type ExcludeRequirementsOptions = GenericRecord<boolean>;

export type UserEntity = InstanceType<typeof User>;

export interface UserProfile {
  userID: string;
  overallEx?: number;
  requirements: RequirementsOptions;
  excludedRequirements: ExcludeRequirementsOptions;
  userQueries: UserQueryProps[];
}
