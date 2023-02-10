import { Profile } from './Profile/Profile';

import { LinkedinScanner } from './LinkedinScanner/LinkedinScanner';

import { GotFriendsScanner } from './GotFriendsScanner/GotFriendsScanner';

import { JobsDB } from '../lib/JobsDB';

import { AllJobScanner } from './AllJobsScanner/AllJobScanner';
import { ScanningFS } from '../lib/ScanningFS';

import { DrushimScanner } from './DrushimScanner/DrushimScanner';

import { UserInput } from './GeneralQuery';
import { Job } from './jobScan';

export class JobsScan {
  profile: Profile;
  linkedinScanner: LinkedinScanner;
  GotFriendsScanner: GotFriendsScanner;
  allJobsScanner: AllJobScanner;
  jobs: JobsDB;
  drushimScanner: DrushimScanner;

  constructor(profile: Profile, userInput: UserInput) {
    this.profile = profile;
    this.jobs = new JobsDB();
    this.linkedinScanner = new LinkedinScanner(userInput, this.profile, this.jobs);
    this.GotFriendsScanner = new GotFriendsScanner(userInput, this.profile, this.jobs);

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
        this.GotFriendsScanner.scanning(preJobs),
        this.allJobsScanner.scanning(preJobs),
        this.drushimScanner.scanning(preJobs),
      ])
    ).flat(1);

    await ScanningFS.writeData(data);
    console.log('end');
  }
}
