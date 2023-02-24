import { RequestHandler } from 'express';
import { QueryOptions } from '../../lib/jobsDB';

import { ScanningFS } from '../../lib/scanningFS';
import { GenericRecord } from '../../lib/types';

import { UsersDB } from '../../lib/usersDB';
import { JobsScanner } from '../jobsScanner/JobsScanner';
import { User } from '../jobsScanner/user/user';

const activeScanner = async (user: User, userDB: UsersDB) => {
  try {
    const jobsScanner = new JobsScanner(user);

    await userDB.updateUser(user);
    console.time('time');
    const results = await jobsScanner.getResults();
    console.timeEnd('time');
    return results;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
const writeResultsScanner = async (user: User) => {
  const jobsScanner = new JobsScanner(user);

  try {
    const results = await jobsScanner.getResults();
    const filterResults = jobsScanner.getFilterResults(results);
    await ScanningFS.writeData(filterResults);
    return true;
  } catch (error) {
    return false;
  }
};

export const startScanner: RequestHandler = async (req, res) => {
  const { user, usersDB } = req.validateBeforeScanner;

  //Active the scanner.
  const results = await activeScanner(user, usersDB);
  if (results) return res.status(200).send({ message: 'Finish!' });
  else return res.status(500).send({ message: 'Something went wrong' });
};

export const downloadResults: RequestHandler = async (req, res) => {
  const { user } = req.validateBeforeScanner;

  //Writes the results into csv file.
  const result = await writeResultsScanner(user);
  if (result) return res.download(ScanningFS.createPathJobsCSV());
  return res.status(500).send({ message: 'Something went wrong' });
};

export const getJobsByQueries: RequestHandler = async (req, res) => {
  const { user } = req.validateBeforeScanner;
  const { hash, ...query } = req.query;
  const matchOptions = query as QueryOptions;
  const jobsScanner = new JobsScanner(user);
  let jobsPosts;

  //If there is hash so get the jobs by hash. Otherwise get the all jobs by user's history queries.
  if (hash) jobsPosts = await jobsScanner.getJobsByHash(String(hash), matchOptions);
  jobsPosts = await jobsScanner.getAllJobByUserQueries(matchOptions);
  const filterResults = jobsScanner.getFilterResults(jobsPosts);
  return res.status(200).send(filterResults);
};
