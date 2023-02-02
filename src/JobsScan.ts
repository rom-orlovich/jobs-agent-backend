import { Profile } from '../lib/Profile';
import { Query } from '../lib/Query';

import { LinkedinScanner } from './LinkedinScanner';

import { Cluster } from 'puppeteer-cluster';

import { GotFriendsScan } from './GotFriendsScan';
import { GenericRecord } from '../lib/types/types';
import { JobsDb } from '../lib/JobsDB';

export interface Log {
  logID: string;
  title: string;
  link: string;
  reason: string;
}
interface QueryOptions {
  linkedinScannerQueryOptions: Query;
  gotFriendsQueryOptions: GenericRecord<unknown>;
}

export class JobsScan {
  queryOptions: QueryOptions;
  profile: Profile;
  // PuppeteerCluster: PuppeteerCluster;

  linkedinScanner: LinkedinScanner;
  gotFriendsScanner: GotFriendsScan;
  jobs: JobsDb;

  constructor(profile: Profile, queryOptions: QueryOptions) {
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
      // retryLimit: 1,
      monitor: true,
      timeout: 1000000,

      puppeteerOptions: { headless: false, defaultViewport: null, slowMo: 250 },
    });

    const scannerProps = {
      profile: this.profile,
      cluster,
      jobs: this.jobs,
    };
    cluster.queue(scannerProps, this.linkedinScanner.taskCreator());

    cluster.queue(scannerProps, this.gotFriendsScanner.taskCreator());

    // Event handler to be called in case of problems
    cluster.on('taskerror', (err, data) => {
      console.log(`Error crawling ${data}: ${err.message}`);
    });

    console.log('end');
    await cluster.idle();
    await cluster.close();
  }
}
