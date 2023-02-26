import { RequestHandler } from 'express';
import { ScanningFS } from '../../lib/scanningFS';
import { UsersDB } from '../../mongoDB/usersDB';
import { JobsScanner } from '../jobsScanner/jobsScanner';
import { User } from '../jobsScanner/user/user';
import { QueryOptionsRes } from './queryValidation';
import { ERROR_CODES } from './errorCodes';
import { Job, JobsResults } from '../../mongoDB/jobsDB/jobsDB.types';

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

const extractFilterReasonFilters = (jobs: Job[]) => {
  const jobsReasons = jobs.map((jobs) => jobs.reason);
  const set = new Set(jobsReasons);
  return [...set];
};

const filterByMatch = (jobs: Job[], queryOptions: QueryOptionsRes) => {
  const filterByMatchResults: Job[] = queryOptions.match.reason
    ? jobs.filter((job) => job.reason?.match(queryOptions.match.reason))
    : jobs;

  return filterByMatchResults;
};
// const filterByMatch = (jobs: Job, queryOptions: QueryOptionsRes) => {
//   const filterByMatch: JobsResults = {
//     ...result,
//     jobs: queryOptions.match.reason
//       ? result.jobs.filter((job) => job.reason?.match(queryOptions.match.reason))
//       : result.jobs,
//     pagination: result.pagination,
//   };
//   return filterByMatch;
// };

export const getJobsByQueries: RequestHandler = async (req, res) => {
  const { user, queryOptions, hash } = req.validateBeforeScanner;
  const result = await getJobsByHashExist(user, queryOptions, hash);
  const reasonsMap = extractFilterReasonFilters(result.jobs);
  const filterResultByMatch = filterByMatch(result.jobs, queryOptions);
  const finalResults: JobsResults = {
    pagination: result.pagination,
    jobs: filterResultByMatch,
    filters: {
      ...result.filters,
      reasons: reasonsMap as string[],
    },
  };
  return res.status(200).send(finalResults);
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
