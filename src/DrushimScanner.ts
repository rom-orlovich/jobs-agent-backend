import { DrushimQueryOptions } from '../lib/DrushimQueryOptions';
import { Profile } from '../lib/Profile';
import { Job } from '../lib/types/linkedinScanner';
import { Scanner } from './Scanner';

export class DrushimScanner extends Scanner<DrushimQueryOptions, null, Job[]> {
  async scanning(profile: Profile, preJobs: Job[]): Promise<Job[]> {
    return [];
  }
}
