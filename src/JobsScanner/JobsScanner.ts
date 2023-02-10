import { Profile } from '../Profile/Profile';

import { LinkedinScanner } from '../LinkedinScanner/LinkedinScanner';

import { GotFriendsScanner } from '../GotFriendsScanner/GotFriendsScanner';

import { JobsDB } from '../../lib/JobsDB';

import { AllJobScanner } from '../AllJobsScanner/AllJobScanner';
import { ScanningFS } from '../../lib/ScanningFS';

import { DrushimScanner } from '../DrushimScanner/DrushimScanner';

import { UserInput } from '../GeneralQuery';
import { Job } from './jobsScanner';

export class JobsScanner {
  profile: Profile;
  linkedinScanner: LinkedinScanner;
  GotFriendsScanner: GotFriendsScanner;
  allJobsScanner: AllJobScanner;
  jobs: JobsDB;
  drushimScanner: DrushimScanner;
  fileName: string;

  constructor(profile: Profile, userInput: UserInput) {
    this.profile = profile;
    this.fileName = JobsScanner.getFileName(userInput.position);
    this.jobs = new JobsDB();
    this.linkedinScanner = new LinkedinScanner(userInput, this.profile, this.jobs);
    this.GotFriendsScanner = new GotFriendsScanner(userInput, this.profile, this.jobs);

    this.allJobsScanner = new AllJobScanner(userInput, this.profile, this.jobs);
    this.drushimScanner = new DrushimScanner(userInput, this.profile, this.jobs);
  }
  private static getFileName(position: string) {
    return (
      position.toLowerCase().replace(' ', '-') +
      ',' +
      new Date().toLocaleString().replace(/\s+/g, '').split('/').join('-')
    );
  }

  async scanning() {
    console.log('start');
    const preJobs = await ScanningFS.loadData<Job>(this.fileName);
    console.log(`Found ${preJobs.length} jobs `);

    const data = (
      await Promise.all([
        this.linkedinScanner.scanning(preJobs),
        this.GotFriendsScanner.scanning(preJobs),
        this.allJobsScanner.scanning(preJobs),
        this.drushimScanner.scanning(preJobs),
      ])
    ).flat(1);

    await ScanningFS.writeData(data, this.fileName);
    console.log('end');
  }
}
