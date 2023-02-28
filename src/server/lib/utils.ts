import { JobsScanner } from '../../jobsScanner/jobsScanner';
import { User } from '../../jobsScanner/user/user';
import { QueryOptionsRes } from './queryValidation';

//If there is hash so get the jobs by hash. Otherwise get the all jobs by user's history queries.
export const getJobsByHashExist = async (
  user: User,
  queryOptions: QueryOptionsRes,
  hash?: string,
  useQueryOptions = true
) => {
  const jobsScanner = new JobsScanner(user, queryOptions);
  let jobs;

  if (hash) jobs = await jobsScanner.getJobsByHash(String(hash), useQueryOptions);
  else jobs = await jobsScanner.getAllJobByUserQueries();

  return jobsScanner.getResults(jobs);
};
