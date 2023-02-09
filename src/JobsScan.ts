import { Profile } from '../lib/Profile';

import { LinkedinScanner } from './LinkedinScanner';

import { GotFriendsScan } from './GotFriendsScan';

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

interface JobsScanQueryOptions {
  linkedinScannerQueryOptions: LinkedinQueryOptions;
  gotFriendsQueryOptions: GotFriendQueryOptions;
  allJobsQueryOptions: AllJobsQueryOptions;
  drushimQueryOptions: DrushimQueryOptions;
}

export class JobsScan {
  profile: Profile;
  linkedinScanner: LinkedinScanner;
  gotFriendsScanner: GotFriendsScan;
  allJobsScanner: AllJobScanner;
  jobs: JobsDB;
  drushimScanner: DrushimScanner;

  constructor(profile: Profile, userInput: UserInput) {
    this.profile = profile;
    this.jobs = new JobsDB();
    this.linkedinScanner = new LinkedinScanner('linkedin', userInput, this.profile, this.jobs);
    this.gotFriendsScanner = new GotFriendsScan('gotFriends', userInput, this.profile, this.jobs);

    this.allJobsScanner = new AllJobScanner('allJobs', userInput, this.profile);
    this.drushimScanner = new DrushimScanner('drushim', userInput, this.profile);
  }

  async scanning() {
    console.log('start');
    const preJobs = await ScanningFS.loadData<Job>();
    console.log(`Found ${preJobs.length} jobs `);

    const data = (
      await Promise.all([
        this.linkedinScanner.scanning(preJobs),
        this.gotFriendsScanner.scanning(preJobs),
        this.allJobsScanner.scanning(preJobs),
        this.drushimScanner.scanning(preJobs),
      ])
    ).flat(1);

    await ScanningFS.writeData(data);
    console.log('end');
  }
}
