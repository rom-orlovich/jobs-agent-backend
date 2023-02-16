import { JobsDB } from '../../lib/jobsDB';
import { RequirementsReader } from './requirementsReader/requirementsReader';

import { AllJobScanner } from './scanners/allJobsScanner/allJobScanner';
import { DrushimScanner } from './scanners/drushimScanner/drushimScanner';
import { GotFriendsScanner } from './scanners/gotFriendsScanner/gotFriendsScanner';
import { LinkedinScanner } from './scanners/linkedinScanner/linkedinScanner';

import { UserEntity } from './user/userEntity';

export class JobsScanner {
  user: UserEntity;
  jobsDB: JobsDB;
  activeQuery: boolean;
  // profile: Profile;
  // jobs: JobsDB;
  // userInput: UserQuery;
  // hash: string;
  constructor(user: UserEntity, activeQuery: boolean) {
    // this.profile = profile;
    this.user = user;
    this.activeQuery = activeQuery;
    this.jobsDB = new JobsDB();
  }

  private async getJobsByHash() {
    const jobs = await this.jobsDB.getJobsByHash(this.user.getCurrentHashQuery());
    return jobs;
  }

  private async getScannerResults() {
    const linkedinScanner = new LinkedinScanner(this.user, this.jobsDB);
    const gotFriendsScanner = new GotFriendsScanner(this.user, this.jobsDB);
    const allJobsScanner = new AllJobScanner(this.user, this.jobsDB);
    const drushimScanner = new DrushimScanner(this.user, this.jobsDB);
    const jobsPostsResults = await Promise.all([
      linkedinScanner.getResults(),
      gotFriendsScanner.getResults(),
      allJobsScanner.getResults(),
      drushimScanner.getResults(),
    ]);
    return jobsPostsResults.flat(1);
  }

  async scanningByUserQuery() {
    const preJobs = await this.getJobsByHash();
    let jobsPosts;
    if (preJobs.length > 100) jobsPosts = preJobs;
    else jobsPosts = await this.getScannerResults();

    return jobsPosts;
  }
  async scanningByCurrentUserQueryHashes() {
    const hashesQueries = this.user.getCurrentHashQueries();
    const jobsPosts = this.jobsDB.getJobsByHashQueries(hashesQueries);
    return jobsPosts;
  }

  async scanning() {
    let jobsPosts;
    if (this.activeQuery) jobsPosts = await this.scanningByUserQuery();
    else jobsPosts = await this.scanningByCurrentUserQueryHashes();

    return jobsPosts;
  }

  async getResults() {
    const jobsPosts = await this.scanning();
    const filterJobs = RequirementsReader.checkRequirementMatchForArray(jobsPosts, this.user);
    return filterJobs;

    // await ScanningFS.writeData(jobs.map(({ text, ...el }) => ({ ...el })));
  }
}

// (async () => {
//   await mongoDB.connect();
//   const n = new JobsScanner(profile, EXAMPLE_QUERY);
//   // n.hashQuery();

//   await n.scanning();
//   await mongoDB.close();
// })();
