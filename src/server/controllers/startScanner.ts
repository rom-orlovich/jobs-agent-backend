import { RequestHandler } from 'express';

import { rabbitMQ, SCANNING_QUEUE } from '..';
import { Job } from '../../../mongoDB/jobsDB/jobsDB.types';

import { JobsScanner } from '../../jobsScanner/jobsScanner';
import { RequirementsReader } from '../../jobsScanner/requirementsReader/requirementsReader';

import { User } from '../../jobsScanner/user/user';

import { QueryOptionsRes } from '../lib/queryValidation';

export const STATUS_SCANNING = {
  PENDING: 100,
  SUCCESS: 200,
  FAILURE: 300,
} as const;

const activeScanner = async (user: User, queryOptions: QueryOptionsRes) => {
  const jobsScanner = new JobsScanner(user, queryOptions);

  console.time('time');
  const jobs = await jobsScanner.scanning();
  console.timeEnd('time');
  return jobs;
};

//After new scanning was successfully done, save the stats about the scanning.
//save the num jobs that were found and the num of the matches.
const saveResultsStats = (user: User, jobs?: Job[]) => {
  //False only if the scanner is failed or the last num results is the same as the current.
  if (!jobs) return;
  if (user.checkNumResultsIsSame(jobs)) return;
  const resultsStats = RequirementsReader.checkRequirementMatchForArray(jobs, user);
  user.setScannerResultsFoundInLastQuery(resultsStats.jobs.length, resultsStats.numMatches);
  return user;
};

export const processMesFun = (id: string) => (statusKey: keyof typeof STATUS_SCANNING) => ({
  id,
  status: STATUS_SCANNING[statusKey],
});

export const startScanner: RequestHandler = (req, res) => {
  const { user, queryOptions, usersDB } = req.validateBeforeScanner;

  const id = new Date().getTime().toString();

  const processMes = processMesFun(id);

  rabbitMQ.sendMessage(SCANNING_QUEUE, processMes('PENDING'));
  //
  //Active the scanner.
  activeScanner(user, queryOptions)
    .then(async (jobs) => {
      //
      //Saved the results stats
      saveResultsStats(user, jobs);

      // Update the user.
      await usersDB.updateUser(user);

      //Send the message back.
      rabbitMQ.sendMessage(SCANNING_QUEUE, processMes('SUCCESS')); //On success
      console.log(processMes('SUCCESS'));
    })
    .catch((err) => {
      console.log(err);
      rabbitMQ.sendMessage(SCANNING_QUEUE, processMes('FAILURE'));
    }); //On failure

  return res.status(200).send(processMes('PENDING'));
};

//Check if the status of the Scanner process
export const checkScannerStatus: RequestHandler = async (req, res) => {
  const processID = req.params.processID;
  let isSuccess;
  let isFailed;
  try {
    const consumer = await rabbitMQ.consumeMessage(SCANNING_QUEUE, (msg) => {
      if (!msg) return;

      //Parse the message
      const content = JSON.parse(msg?.content.toString());
      const isProcess = content.id === processID;

      //Check status of scanner with the provided id.
      if (isProcess) {
        isSuccess = content.status === 200;
        isFailed = content.status === 300;
        console.log('consumer', 'isSuccess', isSuccess, 'isFailed', isFailed);
        console.log(content, processID);
        rabbitMQ.channel?.ack(msg);
      }
    });
    //Close the channel after each check.
    await rabbitMQ.channel?.cancel(consumer?.consumerTag || '');
  } catch (error) {
    console.log(error);
  }

  if (isSuccess) return res.send(processMesFun(processID)('SUCCESS'));
  if (isFailed) return res.send(processMesFun(processID)('FAILURE'));

  return res.send(processMesFun(processID)('PENDING'));
};
