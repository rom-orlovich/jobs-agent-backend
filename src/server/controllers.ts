import { RequestHandler } from 'express';
import { EXAMPLE_USER } from '.';
import { ScanningFS } from '../../lib/scanningFS';
import { UsersDB } from '../../lib/usersDB';
import { JobsScanner } from '../jobsScanner/JobsScanner';

export const startScanner: RequestHandler = async (req, res) => {
  const userID = EXAMPLE_USER?.userID || (req.query.userID as string);
  const activeQuery = Boolean(req.query.activeQuery);
  if (!userID) return res.status(400);

  const userDB = new UsersDB();
  const user = EXAMPLE_USER || (await userDB.loadUser(userID));
  if (!user) return res.status(400);
  const jobsScanner = new JobsScanner(user, activeQuery);
  await userDB.updateUser(user);
  console.time('time');
  const results = await jobsScanner.scanning();
  console.timeEnd('time');

  res.status(200).send(results);
};

export const downloadResults: RequestHandler = async (req, res) => {
  const userID = EXAMPLE_USER?.userID || (req.query.userID as string);
  const activeQuery = Boolean(req.query.activeQuery);
  if (!userID) return res.status(400);

  const userDB = new UsersDB();
  const user = EXAMPLE_USER || (await userDB.loadUser(userID));
  if (!user) return res.status(400);
  const jobsScanner = new JobsScanner(user, activeQuery);
  const results = await jobsScanner.getResults();
  await ScanningFS.writeData(results);
  return res.download(ScanningFS.createPathJobsCSV());
};

export const hello: RequestHandler = (req, res) => {
  res.send('hello');
};
