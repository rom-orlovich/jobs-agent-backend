import { RequestHandler } from 'express';
import { JobsDB } from '../../../mongoDB/jobsDB/jobsDB';
import { FacetFilterResults, Job, JobsResults } from '../../../mongoDB/jobsDB/jobsDB.types';
import { getJobsByHashExist } from '../lib/utils';

import { QueryOptionsRes } from '../lib/queryValidation';
import { UserEntity, UserProfile } from '../../jobsScanner/user/userEntity.types';

/**
 * For client filter.
 * @param {UserProfile["jobsObserved"] } jobsObserved The array of jobs the the user observed.
 * @returns {string[]} Map of all the user's jobs observed list.
 */
const getUserJobsObservedMap = (jobsObserved: string[]): Map<string, boolean> => {
  const map = new Map<string, boolean>();
  jobsObserved.forEach((jobID) => map.set(jobID, true));
  return map;
};

/**
 * For client filter.
 * @param {Jobs[] } jobs The array of jobs.
 * @returns {string[]} of the reason from all the jobs.
 */
const extractFilterReasonFilters = (jobs: Job[]): string[] => {
  const jobsReasons = jobs.map((jobs) => jobs.reason) as string[];
  const set = new Set<string>(jobsReasons);
  return [...set];
};

interface FilterByMatchReturn {
  curResults: Job[];
  total: number;
  numResultsSlice: number;
}

/**
 *The 'reason' property of the job entity is not saved in the DB and therefore it is not available
 while mongoDB aggregation function is execute and create the filters array.
 The reason property only available after the RequirementReader algo is execute.
 So the filters are created 'manually'.
 * @param {Job[]} jobs Array of the current jobs
 * @param {RegExp} reason  The regex of the current filter reason
 * @returns {FacetFilterResults} A new FacetFilterResults according to the result of the match filter by reason.
 */

const createFiltersByNonDBValues = (jobs: Job[], reason: RegExp): FacetFilterResults => {
  const filters = {
    _id: '',
    companies: new Set<string>(),
    from: new Set<string>(),
    locations: new Set<string>(),
    reasons: new Set<string>(),
    titles: new Set<string>(),
  };

  jobs.forEach((job) => {
    if (!job.reason?.match(reason)) return;
    job?.company && filters.companies.add(job.company);
    job.from && filters.from.add(job.from);
    job.location && filters.locations.add(job.location);
    job.reason && filters.reasons.add(job.reason);
    job.title && filters.titles.add(job.title);
  });

  return {
    _id: '',
    companies: [...filters.companies],
    from: [...filters.from],
    locations: [...filters.locations],
    reasons: [...filters.reasons],
    titles: [...filters.titles],
  };
};

const filterByJobsObserved = (jobs: Job[], userProfile: UserEntity, queryOptions: QueryOptionsRes) => {
  const { jobsObserved } = userProfile;
  const { jobObserved } = queryOptions;

  if (!jobsObserved?.length) return jobs;
  //Get the map data structure of all the jobs the user has observed.
  const jobsObservedMap = getUserJobsObservedMap(jobsObserved);

  const resultsFilter = jobs.filter((jobs) => {
    //If the user marks the option that the user wants only the jobs that has already observed.
    if (jobObserved) if (jobsObservedMap.get(jobs.jobID)) return true;

    //If the user marks the option that the user wants only the jobs that he hasn't observed.
    if (!jobObserved) if (!jobsObservedMap.get(jobs.jobID)) return true;
  });
  return resultsFilter;
};

/**
 * The jobs from form DB have not reason or jobObserved fields, So its impossible to filter by the those filters the DB
 * and implement pagination for them.
 * @param {Jobs[] } jobs
 * @param { UserEntity} user The user profile.
 * @param {QueryOptionsRes} queryOptions  The queries params from the client to get the jobs data.
 * @returns {FilterByMatchReturn} If there is query of match reason, so filter out all the jobs that start with this reason.
 * Otherwise use the current jobs array. Return the curResult and the number of results.
 */

const filterByNonDBValues = (
  jobs: Job[],
  user: UserEntity,
  queryOptions: QueryOptionsRes
): FilterByMatchReturn => {
  const limit = JobsDB.getLimit(queryOptions.limit);

  const page = JobsDB.getPage(queryOptions.page);

  let numResults;
  let curResults = jobs;

  //Check if there is a reason or jobObserved field,
  //If it does apply the filter by those filter and save the length of the current filter
  // and apply the 'manual' pagination.
  if (queryOptions.match.reason || queryOptions.jobObserved !== undefined) {
    if (queryOptions.jobObserved !== undefined)
      curResults = filterByJobsObserved(curResults, user, queryOptions);

    if (queryOptions.match.reason)
      curResults = curResults.filter((job) => job.reason?.match(queryOptions?.match?.reason));

    numResults = curResults.length; //Num results before slice the decrease the number of the results.
    curResults = curResults.slice(page - 1, page + limit);
  } else {
    curResults = jobs;
    numResults = jobs.length;
  }

  return { curResults, numResultsSlice: curResults.length, total: numResults };
};

/**

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
  const { filters, pagination, numMatches, jobs } = curResult;

  // Check if there is match reason or jobObserved exist. If it does use the length of jobsAfterFilter numResultsSlice.
  const isNonDBFilters = queryOptions?.match?.reason || queryOptions.jobObserved !== undefined;

  //Get the arrays of the current filters.
  const curFilters = isNonDBFilters
    ? createFiltersByNonDBValues(jobsAfterFilter.curResults, queryOptions.match.reason)
    : { ...filters, reasons: extractFilterReasonFilters(jobsAfterFilter.curResults) };

  // The current limit.
  const limit = queryOptions?.limit || JobsDB.DEFAULT_LIMIT;

  //This variable is for checking if there is more 'pages' to fetch after this page.
  const curNumResultsByMatchReasonCompare = isNonDBFilters
    ? jobsAfterFilter.numResultsSlice
    : jobs.length;

  //Check the current total results.
  const curNumResultFound = isNonDBFilters ? jobsAfterFilter.total : pagination.numResultsAfterFilter;

  // Check if the num jobs results that found as a result of the aggregation from the DB or manual pagination,
  // is bigger than the current limit. If it does there is no more data to fetch.
  const hasMore = curNumResultsByMatchReasonCompare >= limit;

  // Normalize the current finalResult.
  const finalResults: JobsResults = {
    numMatches,
    jobs: jobsAfterFilter.curResults,
    pagination: {
      ...pagination,
      hasMore: hasMore,
      numResultsAfterFilter: curNumResultFound,
    },
    filters: curFilters,
  };
  return finalResults;
};

export const getJobs: RequestHandler = async (req, res) => {
  const { user, queryOptions, hash, usersDB } = req.validateBeforeScanner;

  const result = await getJobsByHashExist(user, queryOptions, hash);

  //Filter results by the match reason and jobsObserved fields if it is exist. Else return the results from the DB as is.
  const jobsAfterFilter = filterByNonDBValues(result.jobs, user, queryOptions);

  //Calculate the final get jobs result.
  const finalResult = getFinalResult(result, jobsAfterFilter, queryOptions);

  await usersDB.updateUser(user);

  console.log(
    finalResult.pagination,
    'finalResult.jobs.length',
    finalResult.jobs.length,
    'finalResult.numMatches',
    finalResult.numMatches
  );
  return res.status(200).send(finalResult);
};
