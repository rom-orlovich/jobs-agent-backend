import { Profile } from '../lib/Profile';

import { LinkedinScanner } from './LinkedinScanner';

import { GotFriendsScan } from './GotFriendsScan';

import { JobsDB } from '../lib/JobsDB';
import { LinkedinQueryOptions } from '../lib/LinkedinQueryOptions';
import { GotFriendQueryOptions } from '../lib/GotFriendsQuery';

interface JobsScanQueryOptions {
  linkedinScannerQueryOptions: LinkedinQueryOptions;
  gotFriendsQueryOptions: GotFriendQueryOptions;
}

export class JobsScan {
  queryOptions: JobsScanQueryOptions;
  profile: Profile;
  linkedinScanner: LinkedinScanner;
  gotFriendsScanner: GotFriendsScan;
  jobs: JobsDB;

  constructor(profile: Profile, queryOptions: JobsScanQueryOptions) {
    this.queryOptions = queryOptions;
    this.profile = profile;

    this.jobs = new JobsDB();
    this.gotFriendsScanner = new GotFriendsScan(queryOptions.gotFriendsQueryOptions, this.jobs);
    this.linkedinScanner = new LinkedinScanner(queryOptions.linkedinScannerQueryOptions, this.jobs);
  }

  async scanning() {
    console.log('start');

    await Promise.all([
      this.linkedinScanner.initPuppeteer(this.profile),
      this.gotFriendsScanner.initPuppeteer(this.profile),
    ]);

    console.log('end');
  }
}
