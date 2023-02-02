import { Profile } from '../lib/Profile';
import { Query } from '../lib/Query';

import { LinkedinScanner } from './LinkedinScanner';

import { Cluster } from 'puppeteer-cluster';
import { ScanningFS } from '../lib/ScanningFS';
import { GotFriendsScan } from './GotFriendsScan';
import { GenericRecord } from '../lib/types/types';

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

  constructor(profile: Profile, queryOptions: QueryOptions) {
    this.queryOptions = queryOptions;
    this.profile = profile;
    this.linkedinScanner = new LinkedinScanner(queryOptions.linkedinScannerQueryOptions);
    this.gotFriendsScanner = new GotFriendsScan(queryOptions.gotFriendsQueryOptions);
  }

  async scanning() {
    console.log('start');
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 2,
      // retryLimit: 1,
      timeout: 1000000,

      puppeteerOptions: { headless: true, defaultViewport: null },
    });
    const jobs = await ScanningFS.loadData();

    const linkedinScannerRes = await cluster.execute(
      { profile: this.profile, jobs: jobs },
      this.linkedinScanner.taskCreator()
    );
    const linkedinGotJobScannerRes = await cluster.execute(
      { profile: this.profile, jobs: [...linkedinScannerRes.jobs, jobs] },
      this.gotFriendsScanner.taskCreator()
    );
    console.log(linkedinGotJobScannerRes);

    // Event handler to be called in case of problems
    cluster.on('taskerror', (err, data) => {
      console.log(`Error crawling ${data}: ${err.message}`);
    });

    console.log('end');
    await cluster.idle();
    await cluster.close();
  }
}
