import { RequestHandler } from 'express';

import { ScanningFS } from '../../lib/scanningFS';

import { UsersDB } from '../../lib/usersDB';
import { JobsScanner } from '../jobsScanner/JobsScanner';
import { User } from '../jobsScanner/user/user';

const activeScanner = async (user: User, userDB: UsersDB, activeQuery: boolean) => {
  try {
    const jobsScanner = new JobsScanner(user, activeQuery);
    await userDB.updateUser(user);
    console.time('time');
    const results = await jobsScanner.scanning();
    console.timeEnd('time');
    return results;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
const writeResultsScanner = async (user: User, activeQuery: boolean) => {
  const jobsScanner = new JobsScanner(user, activeQuery);

  try {
    const results = await jobsScanner.getResults();
    await ScanningFS.writeData(results);
    return true;
  } catch (error) {
    return false;
  }
};

export const startScanner: RequestHandler = async (req, res) => {
  const { user, activeQuery, usersDB } = req.validateBeforeScanner;
  //Active the scanner.
  const results = await activeScanner(user, usersDB, activeQuery);
  if (results) return res.status(200).send(results);
  else return res.status(500).send({ message: 'Something went wrong' });
};

export const downloadResults: RequestHandler = async (req, res) => {
  const { activeQuery, user } = req.validateBeforeScanner;
  //Writes the results into csv file.
  const result = await writeResultsScanner(user, activeQuery);
  if (result) return res.download(ScanningFS.createPathJobsCSV());
  return res.status(500).send({ message: 'Something went wrong' });
};

/**
 * const activeScanner = async (user: User, userDB: UsersDB, activeQuery: boolean) => {
  // try {
  const jobsScanner = new JobsScanner(user, activeQuery);
  await userDB.updateUser(user);
  console.time('time');
  const results = await jobsScanner.scanning();
  console.timeEnd('time');
  //   return results;
  // } catch (error) {
  //   console.log(error);
  //   return ;
  // }
};
const writeResultsScanner = async (user: User, activeQuery: boolean) => {
  const jobsScanner = new JobsScanner(user, activeQuery);

  try {
    const results = await jobsScanner.getResults();
    await ScanningFS.writeData(results);
    return true;
  } catch (error) {
    return false;
  }
};

export const startScanner: RequestHandler = async (req, res) => {
  const { user, activeQuery, usersDB } = req.validateBeforeScanner;
  //Active the scanner.
  try {
    activeScanner(user, usersDB, activeQuery);
    res.status(200).send({ message: 'Scanner start' });
  } catch (error) {
    res.status(500).send({ message: 'Something went wrong' });
  }

  // if (results) return
  // else return
};
 */
