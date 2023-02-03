import { Profile } from '../lib/Profile';

import { LinkedinScanner } from './LinkedinScanner';

import { Cluster } from 'puppeteer-cluster';

import { GotFriendsScan } from './GotFriendsScan';

import { JobsDb } from '../lib/JobsDB';
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
  jobs: JobsDb;

  constructor(profile: Profile, queryOptions: JobsScanQueryOptions) {
    this.queryOptions = queryOptions;
    this.profile = profile;
    this.linkedinScanner = new LinkedinScanner(queryOptions.linkedinScannerQueryOptions);
    this.gotFriendsScanner = new GotFriendsScan(queryOptions.gotFriendsQueryOptions);
    this.jobs = new JobsDb();
  }

  async scanning() {
    console.log('start');
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 4,
      monitor: true,
      // timeout: 1000000,
      puppeteerOptions: { headless: false, defaultViewport: null, slowMo: 250 },
    });

    const scannerProps = {
      cluster,
      jobs: this.jobs,
      profile: this.profile,
    };

    cluster.queue(scannerProps, this.linkedinScanner.taskCreator());

    cluster.queue(scannerProps, this.gotFriendsScanner.taskCreator());

    // Event handler to be called in case of problems
    cluster.on('taskerror', (err, data) => {
      console.log(`Error crawling ${data}: ${err.message}`);
    });

    await cluster.idle();
    await cluster.close();
    console.log('end');
  }
}
