import { Profile } from './user/user';

import { LinkedinScanner } from '../LinkedinScanner/LinkedinScanner';

import { GotFriendsScanner } from '../GotFriendsScanner/GotFriendsScanner';

import { JobsDB } from '../../lib/JobsDB';

import { AllJobScanner } from '../AllJobsScanner/AllJobScanner';
import { ScanningFS } from '../../lib/ScanningFS';

import { DrushimScanner } from '../DrushimScanner/DrushimScanner';

import { UserQuery } from './generalQuery/generalQuery';

import { RequirementsReader } from '../RequirementsReader/RequirementsReader';
import { GeneralQuery } from './generalQuery/generalQuery';
import { UserDB, UsersDB } from '../../lib/UsersDB';
import { UserEntity } from './user/user';

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

  // async loadUser(userID: string) {
  //   const user = await this.usersDB.loadUser(userID);
  //   return user;
  // }

  private async getJobsByHash() {
    const jobs = await this.jobsDB.getJobsByHash(this.hash);
    return jobs;
  }

  private async getScannerResults() {
    const linkedinScanner = new LinkedinScanner(user, this.jobs);
    const gotFriendsScanner = new GotFriendsScanner(user, this.jobs);
    const allJobsScanner = new AllJobScanner(user, this.jobs);
    const drushimScanner = new DrushimScanner(user, this.jobs);
    const jobsPostsResults = await Promise.all([
      linkedinScanner.getResults(this.hash),
      gotFriendsScanner.getResults(this.hash),
      allJobsScanner.getResults(this.hash),
      drushimScanner.getResults(this.hash),
    ]);
    return jobsPostsResults.flat(1);
  }

  async getResultByUserQuery(user:UserEntity) {
    const preJobs = await this.getJobsByHash();
    let jobsPosts;
    if (preJobs.length > 100) jobsPosts = preJobs;
    else jobsPosts = await this.getScannerResults(user);

    return jobsPosts;
  }
  //   async getResultByProfileQueryHashes() {}

  async scanning(userID: string) {
    // const user = await this.loadUser(userID);
    // if (!user) return { message: 'No user is found' };
    // if (user.isUserQueryActive()) this.getResultByUserQuery(user);
    // else

    // const preJobs = await this.getJobsByHash();
    // let jobsPosts;
    // if (preJobs.length > 100) jobsPosts = preJobs;
    // else jobsPosts = await this.getScannerResults();
    else const jobs = RequirementsReader.checkRequirementMatchForArray(jobsPosts, this.profile);

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
