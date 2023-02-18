import { RequestHandler } from 'express';
import { EXAMPLE_USER } from '.';
import { ScanningFS } from '../../lib/scanningFS';
import { UsersDB } from '../../lib/usersDB';
import { JobsScanner } from '../jobsScanner/JobsScanner';

export const startScanner: RequestHandler = async (req, res) => {
  const userID = req.params.userID as string;
  const activeQuery = Boolean(req.query.activeQuery);

  if (!userID) return res.status(400);

  const userDB = new UsersDB();
  const user = await userDB.loadUser(userID);

  if (!user) return res.status(400);
  try {
    const jobsScanner = new JobsScanner(user, activeQuery);
    await userDB.updateUser(user);
    console.time('time');
    const results = await jobsScanner.scanning();
    console.timeEnd('time');
    return res.status(200).send(results);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'something went wrong' });
  }
};

export const downloadResults: RequestHandler = async (req, res) => {
  const userID = req.params.userID as string;
  const activeQuery = Boolean(req.query.activeQuery);
  if (!userID) return res.status(400);

  const userDB = new UsersDB();
  const user = await userDB.loadUser(userID);
  if (!user) return res.status(400);
  console.log(user);
  const jobsScanner = new JobsScanner(user, activeQuery);
  const results = await jobsScanner.getResults();
  await ScanningFS.writeData(results);
  return res.download(ScanningFS.createPathJobsCSV());
};

export const hello: RequestHandler = (req, res) => {
  res.send({ message: 'hello' });
};
