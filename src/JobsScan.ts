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

interface JobsScanQueryOptions {
  linkedinScannerQueryOptions: LinkedinQueryOptions;
  gotFriendsQueryOptions: GotFriendQueryOptions;
  allJobsQueryOptions: AllJobsQueryOptions;
}

export class JobsScan {
  queryOptions: JobsScanQueryOptions;
  profile: Profile;
  linkedinScanner: LinkedinScanner;
  gotFriendsScanner: GotFriendsScan;
  allJobsScanner: AllJobScanner;
  jobs: JobsDB;

  constructor(profile: Profile, queryOptions: JobsScanQueryOptions) {
    this.queryOptions = queryOptions;
    this.profile = profile;

    this.jobs = new JobsDB();
    this.gotFriendsScanner = new GotFriendsScan(
      queryOptions.gotFriendsQueryOptions,
      this.profile,
      this.jobs
    );
    this.linkedinScanner = new LinkedinScanner(
      queryOptions.linkedinScannerQueryOptions,
      this.profile,
      this.jobs
    );
    this.allJobsScanner = new AllJobScanner(queryOptions.allJobsQueryOptions, this.profile);
  }

  async scanning() {
    console.log('start');
    const preJobs = await ScanningFS.loadData<Job>();
    console.log(`Found ${preJobs.length} jobs `);
    const data = (
      await Promise.all([
        this.linkedinScanner.initPuppeteer(preJobs),
        this.gotFriendsScanner.initPuppeteer(preJobs),
        this.allJobsScanner.scanning(preJobs),
      ])
    ).flat(1);

    await ScanningFS.writeData(data);
    console.log('end');
  }
}
