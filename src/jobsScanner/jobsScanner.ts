import { JobsDB } from '../../mongoDB/jobsDB/jobsDB';
import { Job, JobsResults, QueryOptionsRes } from '../../mongoDB/jobsDB/jobsDB.types';

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
  queryOptions: QueryOptionsRes;
  constructor(user: UserEntity, queryOptionsRes: QueryOptionsRes) {
    this.user = user;
    this.queryOptions = queryOptionsRes;
    this.jobsDB = new JobsDB();
  }

  /**
   * Initialize the instance of the scanners and start the scanning
   * in order to get their results.
   * @returns {Promise<Job[]>} Array of the JobsPost objects.
   */
  private async getScannerResults(): Promise<Job[]> {
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
   * @returns {Promise<JobsResults>} The result of the find jobs query.
   */
  async getJobsByHash(hash: string): Promise<JobsResults> {
    const jobs = await this.jobsDB.getJobsByHash(hash, this.queryOptions);
    return jobs;
  }

  /**
   *Create user's hashQuery string array and gets all the jobs that match
   the user's history queries by their current hashQueries array.
   * @returns {Promise<JobsResults>} - The result of the find jobs query.
   */
  async getAllJobByUserQueries(): Promise<JobsResults> {
    const hashesQueries = this.user.getAllHashes();
    const jobs = this.jobsDB.getJobsByHashQueries(hashesQueries, this.queryOptions);
    return jobs;
  }

  /**
   * Gets the jobs that have the same hash as user's hashQuery.
   * If the amount of the jobs are lower than 100, use the hash results.
   * Otherwise create a new jobs scanner.
   */
  async scanningByUserQuery() {
    const JobsByHashResult = await this.getJobsByHash(this.user.getLastHashQuery());
    if (JobsByHashResult.pagination.total < 100) await this.getScannerResults();
  }

  async scanning() {
    console.log('here');
    await this.scanningByUserQuery();
    await this.jobsDB.createTTLindex(); //Create TTL (time to live) index if is not exist.
  }

  getResults(result: JobsResults): JobsResults {
    return {
      jobs: RequirementsReader.checkRequirementMatchForArray(result.jobs, this.user),
      pagination: result.pagination,
    };
  }

  // async getResults() {
  //   await this.scanning();
  //   // const filterJobs = this.getFilterResults(jobs);
  // }
}

// (async () => {
//   await mongoDB.connect();
//   const n = new JobsScanner(profile, EXAMPLE_QUERY);
//   // n.hashQuery();

//   await n.scanning();
//   await mongoDB.close();
// })();
