import { Profile } from '../src/Profile/Profile';

import { LinkedinScanner } from '../src/LinkedinScanner/LinkedinScanner';

import { GotFriendsScanner } from '../src/GotFriendsScanner/GotFriendsScanner';

import { JobsDB } from '../lib/JobsDB';

import { AllJobScanner } from '../src/AllJobsScanner/AllJobScanner';
import { ScanningFS } from '../lib/ScanningFS';

import { DrushimScanner } from '../src/DrushimScanner/DrushimScanner';

import { UserInput } from '../src/GeneralQuery/generalQuery';

import { RequirementsReader } from '../src/RequirementsReader/RequirementsReader';
import { GeneralQuery } from '../src/GeneralQuery/GeneralQuery';

export class JobsScanner {
  profile: Profile;

  jobs: JobsDB;

  userInput: UserInput;
  hash: string;
  constructor(profile: Profile, userInput: UserInput) {
    this.profile = profile;
    this.jobs = new JobsDB();
    this.userInput = userInput;

    this.hash = GeneralQuery.hashQuery(userInput);
  }

  private async getJobsByHash() {
    const jobs = await this.jobs.getJobsByHash(this.hash);
    return jobs;
  }

  private async getScannerResults(userInput: UserInput) {
    const linkedinScanner = new LinkedinScanner(userInput, this.profile, this.jobs);
    const gotFriendsScanner = new GotFriendsScanner(userInput, this.profile, this.jobs);
    const allJobsScanner = new AllJobScanner(userInput, this.profile, this.jobs);
    const drushimScanner = new DrushimScanner(userInput, this.profile, this.jobs);
    const jobsPostsResults = await Promise.all([
      linkedinScanner.getResults(this.hash),
      gotFriendsScanner.getResults(this.hash),
      allJobsScanner.getResults(this.hash),
      drushimScanner.getResults(this.hash),
    ]);
    return jobsPostsResults.flat(1);
  }

  async getResultByUserInput(userInput: UserInput) {
    const preJobs = await this.getJobsByHash();
    let jobsPosts;
    if (preJobs.length > 100) jobsPosts = preJobs;
    else jobsPosts = await this.getScannerResults(userInput);

    return jobsPosts;
  }
  //   async getResultByProfileQueryHashes() {}

  async scanning() {
    console.log('start');
    // const preJobs = await this.getJobsByHash();
    // let jobsPosts;
    // if (preJobs.length > 100) jobsPosts = preJobs;
    // else jobsPosts = await this.getScannerResults();

    const jobs = RequirementsReader.checkRequirementMatchForArray(jobsPosts, this.profile);

    await ScanningFS.writeData(jobs.map(({ text, ...el }) => ({ ...el })));
    console.log('end');
  }
}

// (async () => {
//   await mongoDB.connect();
//   const n = new JobsScanner(profile, exampleQuery);
//   // n.hashQuery();

//   await n.scanning();
//   await mongoDB.close();
// })();
