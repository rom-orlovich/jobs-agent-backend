import { Profile } from '../src/Profile/Profile';

import { LinkedinScanner } from '../src/LinkedinScanner/LinkedinScanner';

import { GotFriendsScanner } from '../src/GotFriendsScanner/GotFriendsScanner';

import { JobsDB } from '../lib/JobsDB';

import { AllJobScanner } from '../src/AllJobsScanner/AllJobScanner';
import { ScanningFS } from '../lib/ScanningFS';

import { DrushimScanner } from '../src/DrushimScanner/DrushimScanner';

import { UserQuery } from '../src/GeneralQuery/generalQuery';

import { RequirementsReader } from '../src/RequirementsReader/RequirementsReader';
import { GeneralQuery } from '../src/GeneralQuery/GeneralQuery';
import { UserDB, UsersDB } from './UsersDB';

export class JobsScanner {
  usersDB: UsersDB;
  jobsDB: JobsDB;
  // profile: Profile;
  // jobs: JobsDB;
  // userInput: UserQuery;
  // hash: string;
  constructor() {
    // this.profile = profile;
    this.usersDB = new UsersDB();
    this.jobsDB = new JobsDB();

    // this.hash = GeneralQuery.hashQuery(userInput);
  }

  async loadUser(userID: string) {
    const user = await this.usersDB.loadUser(userID);
    return user;
  }

  private async getJobsByHash() {
    const jobs = await this.jobs.getJobsByHash(this.hash);
    return jobs;
  }

  private async getScannerResults() {
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

  async getResultByUserQuery(userInput: UserQuery) {
    const preJobs = await this.getJobsByHash();
    let jobsPosts;
    if (preJobs.length > 100) jobsPosts = preJobs;
    else jobsPosts = await this.getScannerResults(userInput);

    return jobsPosts;
  }
  //   async getResultByProfileQueryHashes() {}

  async scanning(userID: string) {
    const user = await this.loadUser(userID);
    if (!user) return { message: 'No user is found' };

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
