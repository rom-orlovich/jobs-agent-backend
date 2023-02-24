import { JobsDB, FilterOptions } from '../../lib/jobsDB';

import { JobPost } from './jobsScanner.types';
import { RequirementsReader } from './requirementsReader/requirementsReader';

import { AllJobScanner } from './scanners/allJobsScanner/allJobScanner';
import { DrushimScanner } from './scanners/drushimScanner/drushimScanner';
import { GotFriendsScanner } from './scanners/gotFriendsScanner/gotFriendsScanner';
import { LinkedinScanner } from './scanners/linkedinScanner/linkedinScanner';

import { UserEntity } from './user/userEntity.types';

/**
 * The JobsScanner is responsible to create a instance of the jobs scanner.
 */
export class JobsScanner {
  user: UserEntity;
  jobsDB: JobsDB;
  searchAll: boolean;

  constructor(user: UserEntity, searchAll = false) {
    this.user = user;
    this.searchAll = searchAll;
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
  async getJobsByHash(hash: string, queryOptions?: FilterOptions): Promise<JobPost[]> {
    const jobsPosts = await this.jobsDB.getJobsByHash(hash, queryOptions);
    return jobsPosts;
  }

  /**
   *Create user's hashQuery string array and gets all the jobsPosts that match
   the user's history queries by their current hashQueries array.
   * @returns {Promise<JobPost[]>} - Array of the JobsPost objects.
   */
  async getAllJobByUserQueries(queryOptions?: FilterOptions): Promise<JobPost[]> {
    const hashesQueries = this.user.getAllHashes();
    const jobsPosts = this.jobsDB.getJobsByHashQueries(hashesQueries, queryOptions);
    return jobsPosts;
  }

  /**
   * Gets the jobsPosts that have the same hash as user's hashQuery.
   * If the amount of the jobs are lower than 100, use the hash results.
   * Otherwise create a new jobs scanner.
   * @returns {Promise<JobPost[]>} - Array of the JobsPost objects.
   */
  async scanningByUserQuery(): Promise<JobPost[]> {
    const preJobs = await this.getJobsByHash(this.user.getLastHashQuery());
    let jobsPosts;
    if (preJobs.length > 100) jobsPosts = preJobs;
    else jobsPosts = await this.getScannerResults();
    return jobsPosts;
  }

  async scanning() {
    const jobsPosts = await this.scanningByUserQuery();
    await this.jobsDB.createTTLindex(); //Create TTL (time to live) index if is not exist.
    return jobsPosts;
  }

  getFilterResults(jobsPosts: JobPost[]) {
    return RequirementsReader.checkRequirementMatchForArray(jobsPosts, this.user);
  }

  async getResults() {
    const results = await this.scanning();
    return results;
    // const filterJobs = this.getFilterResults(jobsPosts);
  }
}

// (async () => {
//   await mongoDB.connect();
//   const n = new JobsScanner(profile, EXAMPLE_QUERY);
//   // n.hashQuery();

//   await n.scanning();
//   await mongoDB.close();
// })();
