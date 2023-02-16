import { Profile } from '../Profile/Profile';

import { LinkedinScanner } from '../LinkedinScanner/LinkedinScanner';

import { GotFriendsScanner } from '../GotFriendsScanner/GotFriendsScanner';

import { JobsDB } from '../../lib/JobsDB';

import { AllJobScanner } from '../AllJobsScanner/AllJobScanner';
import { ScanningFS } from '../../lib/ScanningFS';

import { DrushimScanner } from '../DrushimScanner/DrushimScanner';

import { UserQuery } from '../GeneralQuery/generalQuery';

import { RequirementsReader } from '../RequirementsReader/RequirementsReader';

export class JobsScanner {
  profile: Profile;
  linkedinScanner: LinkedinScanner;
  GotFriendsScanner: GotFriendsScanner;
  allJobsScanner: AllJobScanner;
  jobs: JobsDB;
  drushimScanner: DrushimScanner;
  userInput: UserQuery;
  hash: string;
  constructor(profile: Profile, userInput: UserQuery) {
    this.profile = profile;
    this.jobs = new JobsDB();
    this.userInput = userInput;
    this.linkedinScanner = new LinkedinScanner(userInput, this.profile, this.jobs);
    this.GotFriendsScanner = new GotFriendsScanner(userInput, this.profile, this.jobs);
    this.allJobsScanner = new AllJobScanner(userInput, this.profile, this.jobs);
    this.drushimScanner = new DrushimScanner(userInput, this.profile, this.jobs);
    this.hash = this.linkedinScanner.linkedinQuery.hash;
  }

  private async getJobsByHash() {
    const jobs = await this.jobs.getJobsByHash(this.hash);
    return jobs;
  }

  private async getScannerResults() {
    const jobsPostsResults = await Promise.all([
      this.linkedinScanner.getResults(this.hash),
      this.GotFriendsScanner.getResults(this.hash),
      this.allJobsScanner.getResults(this.hash),
      this.drushimScanner.getResults(this.hash),
    ]);
    return jobsPostsResults.flat(1);
  }

  async scanning() {
    console.log('start');
    const preJobs = await this.getJobsByHash();
    let jobsPosts;

    if (preJobs.length > 100) jobsPosts = preJobs;
    else jobsPosts = await this.getScannerResults();

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
