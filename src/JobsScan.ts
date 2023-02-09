import { Profile } from '../lib/Profile';

import { LinkedinScanner } from './LinkedinScanner';

import { GotFriendsScanner } from './GotFriendsScanner';

import { JobsDB } from '../lib/JobsDB';
import { LinkedinQueryOptions } from '../lib/LinkedinQueryOptions';
import { GotFriendQueryOptions } from '../lib/GotFriendsQuery';
import { AllJobsQueryOptions } from '../lib/AllJobQueryOptions';
import { AllJobScanner } from './AllJobScanner';
import { ScanningFS } from '../lib/ScanningFS';
import { Job } from '../lib/types/linkedinScanner';

import { DrushimScanner } from './DrushimScanner';
import { DrushimQueryOptions } from '../lib/DrushimQueryOptions';
import { GeneralQuery, UserInput } from '../lib/GeneralQuery';

// interface JobsScanQueryOptions {
//   linkedinScannerQueryOptions: LinkedinQueryOptions;
//   gotFriendsQueryOptions: GotFriendQueryOptions;
//   allJobsQueryOptions: AllJobsQueryOptions;
//   drushimQueryOptions: DrushimQueryOptions;
// }

export class JobsScan {
  profile: Profile;
  linkedinScanner: LinkedinScanner;
  GotFriendsScannerner: GotFriendsScanner;
  allJobsScanner: AllJobScanner;
  jobs: JobsDB;
  drushimScanner: DrushimScanner;

  constructor(profile: Profile, userInput: UserInput) {
    this.profile = profile;
    this.jobs = new JobsDB();
    this.linkedinScanner = new LinkedinScanner(userInput, this.profile, this.jobs);
    this.GotFriendsScannerner = new GotFriendsScanner(userInput, this.profile, this.jobs);

    this.allJobsScanner = new AllJobScanner(userInput, this.profile, this.jobs);
    this.drushimScanner = new DrushimScanner(userInput, this.profile, this.jobs);
  }

  async scanning() {
    console.log('start');
    const preJobs = await ScanningFS.loadData<Job>();
    console.log(`Found ${preJobs.length} jobs `);

    const data = (
      await Promise.all([
        this.linkedinScanner.scanning(preJobs),
        this.GotFriendsScannerner.scanning(preJobs),
        this.allJobsScanner.scanning(preJobs),
        this.drushimScanner.scanning(preJobs),
      ])
    ).flat(1);

    await ScanningFS.writeData(data);
    console.log('end');
  }
}
