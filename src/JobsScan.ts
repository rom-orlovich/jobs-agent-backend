import { Profile } from '../lib/Profile';
import { Query } from '../lib/Query';

import { LinkedinScan } from './LinkedinScan';

import { Cluster } from 'puppeteer-cluster';
import { ScanningFS } from '../lib/ScanningFS';

export interface Log {
  logID: string;
  title: string;
  link: string;
  reason: string;
}
export class JobsScan {
  queryOptions: Query;
  profile: Profile;
  // PuppeteerCluster: PuppeteerCluster;
  linkedinScanner: LinkedinScan;

  constructor(profile: Profile, queryOptions: Query) {
    this.queryOptions = queryOptions;
    this.profile = profile;
    // this.PuppeteerCluster = new PuppeteerCluster();
    this.linkedinScanner = new LinkedinScan(this.queryOptions);
  }

  async _scanning() {
    // const pathJobs = this._createPathPotentialJobsJSON();
    // const pathLogs = this._createPathLogsJobJSON();
    // const potentialJobs = await this.loadJSON<Job>(pathJobs);
    // const jobLogs = await this.loadJSON<Log>(pathLogs);
    // const { curJobs, curLogs } = await this.linkedinScanner.scanning(
    //   this.PuppeteerCluster,
    //   this.queryOptions,
    //   potentialJobs,
    //   jobLogs
    // );
    // potentialJobs = [...potentialJobs, ...curJobs];
    // jobLogs = [...jobLogs, ...curLogs];
    // console.log('finish fetch jobs');
    // await this._writeJSON(potentialJobs, pathJobs);
    // await this._writeJSON(jobLogs, pathLogs);
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

    cluster.queue(
      { profile: this.profile, jobs: await ScanningFS.loadData() },
      this.linkedinScanner.scanning()
    );

    // Event handler to be called in case of problems
    cluster.on('taskerror', (err, data) => {
      console.log(`Error crawling ${data}: ${err.message}`);
    });

    console.log('end');
    await cluster.idle();
    await cluster.close();
  }
}
