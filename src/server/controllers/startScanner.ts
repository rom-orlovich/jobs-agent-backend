import { RequestHandler } from 'express';

import { rabbitMQ, SCANNING_QUEUE } from '..';
import { Job } from '../../../mongoDB/jobsDB/jobsDB.types';
import { RabbitMQ } from '../../../rabbitMQ/rabbitMQ';

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

  const resultsStats = RequirementsReader.checkRequirementMatchForArray(jobs, user);
  user.setScannerResultsFoundInLastQuery(resultsStats.jobs.length, resultsStats.numMatches);
  return user;
};

export const getProcessMesByID = (id: string) => (statusKey: keyof typeof STATUS_SCANNING) => ({
  id,
  status: STATUS_SCANNING[statusKey],
});

export const startScanner: RequestHandler = (req, res) => {
  const { user, queryOptions, usersDB } = req.validateBeforeScanner;

  const id = new Date().getTime().toString();

  const genProcessMes = getProcessMesByID(id);

  //
  //Active the scanner.
  activeScanner(user, queryOptions)
    .then(async (jobs) => {
      //On success
      //Saved the results stats
      saveResultsStats(user, jobs);

      // Update the user.
      await usersDB.updateUser(user);

      //Send the message back.
      rabbitMQ.sendMessage(SCANNING_QUEUE, genProcessMes('SUCCESS'));
    })
    .catch((err) => {
      //On failure.
      console.log(err);
      rabbitMQ.sendMessage(SCANNING_QUEUE, genProcessMes('FAILURE'));
    });

  return res.status(200).send(genProcessMes('PENDING'));
};

//Check the status of the scanning process of each active scanner.
export const checkScannerStatus: RequestHandler = async (req, res) => {
  const processID = req.params.processID;
  const genProcessMes = getProcessMesByID(processID);
  let isSuccess;
  let isFailed;
  let isEmpty;
  try {
    const consumer = await rabbitMQ.consumeMessage(SCANNING_QUEUE, (msg) => {
      console.log('start consuming for process', processID);
      if (!msg) {
        isEmpty = true;
        return;
      }

      //Parse the message
      const content = JSON.parse(msg?.content.toString());

      //Check if the message timeout is not expired.
      const isMessageTimeoutExpire = RabbitMQ.isMessageTimeoutExpire(content.id);
      if (isMessageTimeoutExpire) {
        console.log(
          'message timeOut',
          isMessageTimeoutExpire,
          'message',
          content,
          'curTime',
          new Date().getTime()
        );
        return rabbitMQ.channel?.ack(msg);
      }

      //Checking for response message content with the request's process id in scanning queue.
      const isProcess = content.id === processID;
      if (isProcess) {
        //If the message is found update the status of the message and acknowledge the message.
        isSuccess = content.status === 200;
        isFailed = content.status === 300;

        console.log('consume', content, processID);
        return rabbitMQ.channel?.ack(msg);
      } else {
        //Otherwise, send back the message content to scanning queue so the consumer that handle this request's process id will consume this message.
        rabbitMQ.sendMessage(SCANNING_QUEUE, content);
        console.log('not consume', content, processID);
      }
    });
    console.log('status', 'isSuccess', isSuccess, 'isFailed', isFailed);

    //Close the channel after each check.
    console.log(`consumer for ${processID}`, consumer?.consumerTag);
    await rabbitMQ.channel?.cancel(consumer?.consumerTag || '');
  } catch (error) {
    console.log(error);
  }

  if (isSuccess) return res.send(genProcessMes('SUCCESS'));

  //If there is not message in the queue and the client is still checking for process status, so it means that something unexpected was happen and return failures status.
  if (isFailed || isEmpty) return res.send(genProcessMes('FAILURE'));

  return res.send(genProcessMes('PENDING'));
};
