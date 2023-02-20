import { JobsDB } from '../../lib/jobsDB';
import { JobPost } from './jobsScanner';
import { RequirementsReader } from './requirementsReader/requirementsReader';

import { AllJobScanner } from './scanners/allJobsScanner/allJobScanner';
import { DrushimScanner } from './scanners/drushimScanner/drushimScanner';
import { GotFriendsScanner } from './scanners/gotFriendsScanner/gotFriendsScanner';
import { LinkedinScanner } from './scanners/linkedinScanner/linkedinScanner';

import { UserEntity } from './user/userEntity';

/**
 * The JobsScanner is responsible to create a instance of the jobs scanner.
 */
export class JobsScanner {
  user: UserEntity;
  jobsDB: JobsDB;
  activeQuery: boolean;

  constructor(user: UserEntity, activeQuery: boolean) {
    this.user = user;
    this.activeQuery = activeQuery;
    this.jobsDB = new JobsDB();
  }

  /**
   * Initialize the instance of the scanners and start the scanning
   * in order to get their results.
   * @returns {Promise<JobPost[]>} Array of the JobsPost objects.
   */
  private async getScannerResults(): Promise<JobPost[]> {
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

  /**
   * @returns {Promise<JobPost[]>} Array of the JobsPost objects that match user's hashQuery.
   */
  private async getJobsByHash(): Promise<JobPost[]> {
    const jobsPosts = await this.jobsDB.getJobsByHash(this.user.getCurrentHashQuery());
    return jobsPosts;
  }

  /**
   * Gets the jobsPosts that have the same hash as user's hashQuery.
   * If the amount of the jobs are lower than 100, use the hash results.
   * Otherwise create a new jobs scanner.
   * @returns {Promise<JobPost[]>} - Array of the JobsPost objects.
   */
  async scanningByUserQuery(): Promise<JobPost[]> {
    const preJobs = await this.getJobsByHash();
    let jobsPosts;
    if (preJobs.length > 100) jobsPosts = preJobs;
    else jobsPosts = await this.getScannerResults();

    return jobsPosts;
  }
  /**
   *Create user's hashQuery string array and gets all the jobsPosts that match 
   the user's history queries by their current hashQueries array.
   * @returns {Promise<JobPost[]>} - Array of the JobsPost objects.
   */
  async scanningByCurrentUserQueryHashes(): Promise<JobPost[]> {
    const hashesQueries = this.user.getCurrentHashQueries();
    const jobsPosts = this.jobsDB.getJobsByHashQueries(hashesQueries);
    return jobsPosts;
  }

  async scanning() {
    let jobsPosts;
    if (this.activeQuery) jobsPosts = await this.scanningByUserQuery();
    else jobsPosts = await this.scanningByCurrentUserQueryHashes();
    await this.jobsDB.createTTLindex(); //Create TTL (time to live) index if is not exist.
    return jobsPosts;
  }

  async getResults() {
    const jobsPosts = await this.scanning();

    const filterJobs = RequirementsReader.checkRequirementMatchForArray(jobsPosts, this.user);
    return filterJobs;
  }
}

// (async () => {
//   await mongoDB.connect();
//   const n = new JobsScanner(profile, EXAMPLE_QUERY);
//   // n.hashQuery();

//   await n.scanning();
//   await mongoDB.close();
// })();
