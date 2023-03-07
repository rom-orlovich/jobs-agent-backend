import { RequestHandler } from 'express';
import { Job } from '../../../mongoDB/jobsDB/jobsDB.types';

import { JobsScanner } from '../../jobsScanner/jobsScanner';
import { RequirementsReader } from '../../jobsScanner/requirementsReader/requirementsReader';

import { User } from '../../jobsScanner/user/user';
import { MESSAGE_CODES } from '../lib/messageCodes';

import { QueryOptionsRes } from '../lib/queryValidation';

const activeScanner = async (user: User, queryOptions: QueryOptionsRes) => {
  try {
    const jobsScanner = new JobsScanner(user, queryOptions);

    console.time('time');
    const jobs = await jobsScanner.scanning();
    console.timeEnd('time');
    return jobs;
  } catch (error) {
    console.log(error);
    return undefined;
  }
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

export const startScanner: RequestHandler = async (req, res) => {
  const { user, queryOptions, usersDB } = req.validateBeforeScanner;

  //Active the scanner.
  const jobs = await activeScanner(user, queryOptions);

  //Saved the results stats
  saveResultsStats(user, jobs);

  // Update the user.
  await usersDB.updateUser(user);

  if (jobs) {
    return res.status(200).send({
      success: true,
      message: 'The jobs scanner was finished successfully',
      code: MESSAGE_CODES.SCANNER_SUCCESS,
    });
  } else
    return res
      .status(500)
      .send({ message: 'Something went wrong', success: false, code: MESSAGE_CODES.SOMETHING_WRONG });
};
