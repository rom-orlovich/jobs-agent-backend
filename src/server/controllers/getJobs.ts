import { RequestHandler } from 'express';
import { JobsDB } from '../../../mongoDB/jobsDB/jobsDB';
import { FacetFilterResults, Job, JobsResults } from '../../../mongoDB/jobsDB/jobsDB.types';
import { getJobsByHashExist } from '../lib/utils';

import { QueryOptionsRes, QueryValidation } from '../lib/queryValidation';

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

const createFiltersByMatchFilter = (jobs: Job[], reason: RegExp): FacetFilterResults => {
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
  // and apply the 'manual' pagination.
  if (queryOptions.match.reason) {
    curResults = jobs.filter((job) => job.reason?.match(queryOptions?.match?.reason));

    numResults = curResults.length; //Num results before slice the decrease the number of the results.

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
  const { filters, pagination, numMatches, jobs } = curResult;

  //Get the arrays of the current filters.
  const curFilters = queryOptions.match.reason
    ? createFiltersByMatchFilter(jobsAfterFilter.curResults, queryOptions.match.reason)
    : { ...filters, reasons: extractFilterReasonFilters(jobsAfterFilter.curResults) };

  // The current limit.
  const limit = queryOptions?.limit || JobsDB.DEFAULT_LIMIT;

  // Check if there is a queryOptions of match reason. If it does use the length of jobsAfterFilter numResultsSlice.
  //This variable is for checking if there is more 'pages' to fetch after this page.
  const curNumResultsByMatchReasonCompare = queryOptions?.match?.reason
    ? jobsAfterFilter.numResultsSlice
    : jobs.length;

  //Check the current total results.
  const curNumResultFound = queryOptions?.match?.reason
    ? jobsAfterFilter.total
    : pagination.numResultsFound;

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
      numResultsFound: curNumResultFound,
    },
    filters: curFilters,
  };
  return finalResults;
};

export const getJobs: RequestHandler = async (req, res) => {
  const { user, queryOptions, hash, usersDB } = req.validateBeforeScanner;

  const result = await getJobsByHashExist(user, queryOptions, hash);

  //Filter results by the match reason if it is exist. Else return the results from the DB as is.
  const jobsAfterFilter = filterByMatch(result.jobs, queryOptions);

  //Calculate the final get jobs result.
  const finalResult = getFinalResult(result, jobsAfterFilter, queryOptions);

  //Update the user profile with the new date about the results that were found if there is not filters.
  if (QueryValidation.QueryEmpty(queryOptions?.match))
    user.setScannerResultsFoundInLastQuery(
      finalResult.pagination.numResultsFound,
      finalResult.numMatches
    );
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
