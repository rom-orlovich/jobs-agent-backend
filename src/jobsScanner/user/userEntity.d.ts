import { UserQuery } from '../generalQuery/query';
import { HashQuery } from './hashQuery';
import { User } from './user';

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

export type UserEntity = InstanceType<typeof User>;
export type HashQueryEntity = InstanceType<typeof HashQuery>;
interface UserOptions {
  _id: string;
  overallEx?: number;
  requirementsOptions: RequirementsOptions;
  excludeTechs: ExcludeTechsOptions;
  blackList: string[];
  userQuery: UserQuery;
  hashQueries: HashQueryEntity[];
}
