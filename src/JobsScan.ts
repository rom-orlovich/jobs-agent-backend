import { Profile } from '../lib/Profile';

import { LinkedinScanner } from './LinkedinScanner';

import { Cluster } from 'puppeteer-cluster';

import { GotFriendsScan } from './GotFriendsScan';

import { JobsDb } from '../lib/JobsDB';
import { LinkedinQueryOptions } from '../lib/LinkedinQueryOptions';
import { GotFriendQueryOptions } from '../lib/GotFriendsQuery';
import { LinkedinRequirementScanner } from './LinkedinRequirementScanner';
import { TaskProps } from './Scanner';
import { Job } from '../lib/types/linkedinScanner';
import throat from 'throat';

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
  linkedinRequirementScanner: LinkedinRequirementScanner;

  constructor(profile: Profile, queryOptions: JobsScanQueryOptions) {
    this.queryOptions = queryOptions;
    this.profile = profile;
    this.linkedinScanner = new LinkedinScanner(queryOptions.linkedinScannerQueryOptions);
    this.gotFriendsScanner = new GotFriendsScan(queryOptions.gotFriendsQueryOptions);
    this.jobs = new JobsDb();
    this.linkedinRequirementScanner = new LinkedinRequirementScanner(null);
  }

  async scanning() {
    console.log('start');
    // const cluster = await Cluster.launch({
    //   concurrency: Cluster.CONCURRENCY_PAGE,
    //   maxConcurrency: 2,
    //   monitor: true,
    //   timeout: 5000000,

    //   puppeteerOptions: {
    //     headless: false,
    //     defaultViewport: null,
    //     slowMo: 250,
    //   },
    // });

    // const scannerProps = {
    //   cluster,
    //   jobs: this.jobs,
    //   profile: this.profile,
    // };

    await Promise.all([
      this.linkedinScanner.initPuppeteer(this.profile),
      this.gotFriendsScanner.initPuppeteer(this.profile),
    ]);

    // this.gotFriendsScanner.initPuppeteer(this.profile);

    // const jobs: Job[] = await cluster.execute(scannerProps, this.linkedinScanner.taskCreator());

    // jobs = await Promise.all(
    //   jobs.map(
    //     throat(2, async (el) => ({
    //       ...el,
    //       reason: await cluster.execute(
    //         { ...scannerProps, URL: el.link },
    //         this.linkedinRequirementScanner.taskCreator()
    //       ),
    //     }))
    //   )
    // );
    // console.log(jobs.length);

    // jobs.map(async (el, i) => {
    //   console.log(i);
    //   await cluster.queue(
    //     { ...scannerProps, URL: el.link },
    //     this.linkedinRequirementScanner.taskCreator()
    //   );
    // });

    // // );
    // console.log(jobs.length);
    // jobs = await Promise.all(
    //   jobs.slice(0, 25).map(async (el) => ({
    //     ...el,
    //     reason: await cluster.execute(
    //       { ...scannerProps, URL: el.link },
    //       this.linkedinRequirementScanner.taskCreator()
    //     ),
    //   }))
    // );

    // jobs = await (async () => {
    //   const jobs: Job[] = [];

    //   // value.map(el=>{cluster.execute(
    //   //   { ...scannerProps, URL: job.link },
    //   //   this.linkedinRequirementScanner.taskCreator()
    //   // );})

    //   for (const job of jobs) {
    //     const reason = await cluster.execute(
    //       { ...scannerProps, URL: job.link },
    //       this.linkedinRequirementScanner.taskCreator()
    //     );
    //     jobs.push({ ...job, reason });
    //   }
    // return await cluster.execute(
    //   { ...scannerProps, curJobs: value },
    //   this.linkedinRequirementScanner.taskCreator()
    // );

    // console.log(jobs);
    // cluster.queue(scannerProps, this.gotFriendsScanner.taskCreator());

    // Event handler to be called in case of problems
    // cluster.on('taskerror', (err, data) => {
    //   console.log(`Error crawling ${data}: ${err.message}`);
    // });

    // await cluster.idle();
    // await cluster.close();
    console.log('end');
  }
}
