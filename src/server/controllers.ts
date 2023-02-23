import { RequestHandler } from 'express';

import { ScanningFS } from '../../lib/scanningFS';

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
    await ScanningFS.writeData(results);
    return true;
  } catch (error) {
    return false;
  }
};

export const startScanner: RequestHandler = async (req, res) => {
  const { user, usersDB } = req.validateBeforeScanner;

  //Active the scanner.
  const results = await activeScanner(user, usersDB);
  if (results) return res.status(200).send(results);
  else return res.status(500).send({ message: 'Something went wrong' });
};

export const downloadResults: RequestHandler = async (req, res) => {
  const { user } = req.validateBeforeScanner;

  //Writes the results into csv file.
  const result = await writeResultsScanner(user);
  if (result) return res.download(ScanningFS.createPathJobsCSV());
  return res.status(500).send({ message: 'Something went wrong' });
};

export const getJobsByHashQuery: RequestHandler = (req, res) => {};
