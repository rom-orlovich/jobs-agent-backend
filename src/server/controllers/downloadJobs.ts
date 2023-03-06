import { RequestHandler } from 'express';

import { MESSAGE_CODES } from '../lib/messageCodes';
import { getJobsByHashExist } from '../lib/utils';
import { QueryOptionsRes } from '../lib/queryValidation';
import { User } from '../../jobsScanner/user/user';
import { ScanningFS } from '../../../lib/scanningFS';

const writeResultsScanner = async (user: User, queryOptions: QueryOptionsRes, hash?: string) => {
  try {
    const result = await getJobsByHashExist(user, queryOptions, hash, false);

    await ScanningFS.writeData(result.jobs);
    return true;
  } catch (error) {
    return false;
  }
};

export const downloadJobs: RequestHandler = async (req, res) => {
  const { user, queryOptions, hash } = req.validateBeforeScanner;

  //Writes the results into csv file.
  const result = await writeResultsScanner(user, queryOptions, hash);

  if (result) return res.download(ScanningFS.createPathJobsCSV());
  return res
    .status(500)
    .send({ message: 'Something went wrong', success: false, code: MESSAGE_CODES.SOMETHING_WRONG });
};
