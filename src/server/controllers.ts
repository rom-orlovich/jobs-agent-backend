import { RequestHandler } from 'express';
import { ScanningFS } from '../../lib/scanningFS';
import { UsersDB } from '../../mongoDB/usersDB';
import { JobsScanner } from '../jobsScanner/jobsScanner';
import { User } from '../jobsScanner/user/user';
import { QueryOptionsRes } from './queryValidation';
import { ERROR_CODES } from './errorCodes';
import { Job, JobsResults } from '../../mongoDB/jobsDB/jobsDB.types';
import { JobsDB } from '../../mongoDB/jobsDB/jobsDB';

const activeScanner = async (user: User, userDB: UsersDB, queryOptions: QueryOptionsRes) => {
  try {
    const jobsScanner = new JobsScanner(user, queryOptions);
    await userDB.updateUser(user);
    console.time('time');
    await jobsScanner.scanning();
    console.timeEnd('time');
    return true;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const startScanner: RequestHandler = async (req, res) => {
  const { user, usersDB, queryOptions } = req.validateBeforeScanner;
  //Active the scanner.

  const result = await activeScanner(user, usersDB, queryOptions);
  if (result)
    return res.status(200).send({
      success: true,
      message: 'The jobs scanner was finished successfully',
      code: ERROR_CODES.SCANNER_SUCCESS,
    });
  else
    return res
      .status(500)
      .send({ message: 'Something went wrong', success: false, code: ERROR_CODES.SOMETHING_WRONG });
};

//If there is hash so get the jobs by hash. Otherwise get the all jobs by user's history queries.
const getJobsByHashExist = async (user: User, queryOptions: QueryOptionsRes, hash?: string) => {
  const jobsScanner = new JobsScanner(user, queryOptions);
  let jobs;

  if (hash) jobs = await jobsScanner.getJobsByHash(String(hash));
  else jobs = await jobsScanner.getAllJobByUserQueries();

  return jobsScanner.getResults(jobs);
};

/**
 * For client filter.
 * @param {Jobs[] } jobs The array of jobs.
 * @returns {(string|undefined)[]} of the reason from all the jobs.
 */
const extractFilterReasonFilters = (jobs: Job[]): (string | undefined)[] => {
  const jobsReasons = jobs.map((jobs) => jobs.reason);
  const set = new Set(jobsReasons);
  return [...set];
};

interface FilterByMatchReturn {
  curResults: Job[];
  total: number;
  numResultsSlice: number;
}

/**
 * The jobs from form DB have not reason field, So its impossible to filter by the reason in the DB
 * and implement pagination for them.
 * @param {Jobs[] } jobs
 * @param {QueryOptionsRes} queryOptions  The queries params from the client to get the jobs data.
 * @returns {FilterByMatchReturn} If there is query of match reason, so filter out all the jobs that start with this reason.
 * Otherwise use the current jobs array. Return the curResult and the number of results.
 */

const filterByMatch = (jobs: Job[], queryOptions: QueryOptionsRes): FilterByMatchReturn => {
  const limit = JobsDB.getLimit(queryOptions.limit);

  const page = JobsDB.getPage(queryOptions.page);

  let numResults;
  let curResults;

  //Check if there is a reason,
  //If it does apply the filter by reason save the length of the current filter
  // and apply the and 'manual' pagination.
  if (queryOptions.match.reason) {
    console.log(queryOptions.match.reason);
    curResults = jobs.filter((job) => job.reason?.match(queryOptions.match.reason));

    numResults = curResults.length;

    curResults = curResults.slice(page - 1, page + limit);
  } else {
    curResults = jobs;
    numResults = jobs.length;
  }

  return { curResults, numResultsSlice: curResults.length, total: numResults };
};

/**
 *
 * @param {JobsResults} curResult  The current results of the jobs aggregation from the DB.
 * @param {Job[]} jobsAfterFilter  The jobs after the function filterByMatch.
 * @param {QueryOptionsRes} queryOptions The queries params from the client to get the jobs data.
 * @returns
 */
const getFinalResult = (
  curResult: JobsResults,
  jobsAfterFilter: FilterByMatchReturn,
  queryOptions: QueryOptionsRes
) => {
  const { filters, pagination } = curResult;
  //Get the array of reasons.
  const reasonsMap = extractFilterReasonFilters(curResult.jobs);

  // The current limit.
  const limit = queryOptions?.limit || JobsDB.DEFAULT_LIMIT;

  // Check if there is a queryOptions of match reason. If it does use the length of jobsAfterFilter numResultsSlice.
  const curNumResultsByMatchReasonCompare = queryOptions.match.reason
    ? jobsAfterFilter.numResultsSlice
    : pagination.numResultsFound;

  const curNumResultFound = queryOptions.match.reason
    ? jobsAfterFilter.total
    : pagination.numResultsFound;

  // Check if the num jobs results that found as a result of the aggregation from the DB or manual pagination,
  // is bigger than the current limit. If it does there is no more data to fetch.
  const hasMore = curNumResultsByMatchReasonCompare >= limit;

  // Normalize the current finalResult.
  const finalResults: JobsResults = {
    jobs: jobsAfterFilter.curResults,
    pagination: {
      ...pagination,
      hasMore: hasMore,
      numResultsFound: curNumResultFound,
    },
    filters: {
      ...filters,
      reasons: reasonsMap as string[],
    },
  };
  return finalResults;
};

export const getJobsByQueries: RequestHandler = async (req, res) => {
  const { user, queryOptions, hash } = req.validateBeforeScanner;
  const result = await getJobsByHashExist(user, queryOptions, hash);

  const jobsAfterFilter = filterByMatch(result.jobs, queryOptions);
  const finalResult = getFinalResult(result, jobsAfterFilter, queryOptions);

  return res.status(200).send(finalResult);
};

const writeResultsScanner = async (user: User, queryOptions: QueryOptionsRes, hash?: string) => {
  try {
    const result = await getJobsByHashExist(user, queryOptions, hash);
    await ScanningFS.writeData(result.jobs);
    return true;
  } catch (error) {
    return false;
  }
};

export const downloadResults: RequestHandler = async (req, res) => {
  const { user, queryOptions, hash } = req.validateBeforeScanner;

  //Writes the results into csv file.
  const result = await writeResultsScanner(user, queryOptions, hash);
  if (result) return res.download(ScanningFS.createPathJobsCSV());
  return res
    .status(500)
    .send({ message: 'Something went wrong', success: false, code: ERROR_CODES.SOMETHING_WRONG });
};
