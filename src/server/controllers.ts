import { RequestHandler } from 'express';
import { EXAMPLE_USER } from '.';
import { ScanningFS } from '../../lib/ScanningFS';
import { UsersDB } from '../../lib/UsersDB';
import { JobsScanner } from '../jobsScanner/JobsScanner';

export const startScanner: RequestHandler = async (req, res) => {
  const userID = EXAMPLE_USER?.userID || (req.query.userID as string);

  if (!userID) return res.status(400);

  const userDB = new UsersDB();
  const user = EXAMPLE_USER || (await userDB.loadUser(userID));
  if (!user) return res.status(400);
  const jobsScanner = new JobsScanner(user);
  console.time('time');
  const results = await jobsScanner.scanning();
  console.timeEnd('time');

  res.status(200).send(results);
};

export const downloadResults: RequestHandler = async (req, res) => {
  const userID = EXAMPLE_USER?.userID || (req.query.userID as string);

  if (!userID) return res.status(400);

  const userDB = new UsersDB();
  const user = EXAMPLE_USER || (await userDB.loadUser(userID));
  if (!user) return res.status(400);
  const jobsScanner = new JobsScanner(user);
  const results = await jobsScanner.scanning();
  await ScanningFS.writeData(results);
  return res.download(ScanningFS.createPathJobsCSV());
};
