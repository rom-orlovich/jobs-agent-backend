import { JobsDB } from '../../mongoDB/jobsDB/jobsDB';
import { Job, JobsResults } from '../../mongoDB/jobsDB/jobsDB.types';
import { QueryOptionsRes } from '../server/lib/queryValidation';

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
  async getJobsByHash(hash: string, useQueryOptions = true): Promise<JobsResults> {
    const jobs = await this.jobsDB.getJobsByHash(hash, this.queryOptions, useQueryOptions);

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

  async startScanningByMinResults(JobsByHashResults: JobsResults) {
    const jobsByHashCurTotalResult = JobsByHashResults?.pagination?.totalDocs || 0;

    //Return empty array, because there is no need to check the stats of the results that were searched before.
    if (jobsByHashCurTotalResult > 100) return JobsByHashResults.jobs;
    await this.getScannerResults();

    //Fetch again the last results of jobs by hash query in order to get the precise number of jobs that are found in that search.
    return (await this.getJobsByHash(this.user.getLastHashQuery())).jobs;
  }

  /**
   * Gets the jobs that have the same hash as user's hashQuery.
   * If the amount of the jobs are lower than 100, use the hash results.
   * Otherwise create a new jobs scanner.
   */
  async scanningByUserQuery() {
    const JobsByHashResult = await this.getJobsByHash(this.user.getLastHashQuery(), false);
    return await this.startScanningByMinResults(JobsByHashResult);
  }

  async scanning() {
    const jobs = await this.scanningByUserQuery();

    await this.jobsDB.createTTLindex(); //Create TTL (time to live) index if is not exist.
    return jobs;
  }

  getResults(result: JobsResults): JobsResults {
    const jobsRequirementsReaderResults = RequirementsReader.checkRequirementMatchForArray(
      result.jobs,
      this.user
    );
    return {
      jobs: jobsRequirementsReaderResults.jobs,
      pagination: result.pagination,
      filters: result.filters,
      numMatches: jobsRequirementsReaderResults.numMatches,
    };
  }
}

//NOTE: These lines of code are for testing.
// (async () => {
//   await mongoDB.connect();
//   const n = new JobsScanner(profile, EXAMPLE_QUERY);
//   // n.hashQuery();

//   await n.scanning();
//   await mongoDB.close();
// })();
