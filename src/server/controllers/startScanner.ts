import { RequestHandler } from 'express';

import { JobsScanner } from '../../jobsScanner/jobsScanner';

import { User } from '../../jobsScanner/user/user';
import { MESSAGE_CODES } from '../lib/messageCodes';

import { QueryOptionsRes } from '../lib/queryValidation';

const activeScanner = async (user: User, queryOptions: QueryOptionsRes) => {
  try {
    const jobsScanner = new JobsScanner(user, queryOptions);

    console.time('time');
    await jobsScanner.scanning();
    console.timeEnd('time');
    return true;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const startScanner: RequestHandler = async (req, res) => {
  const { user, queryOptions, usersDB } = req.validateBeforeScanner;

  //Active the scanner.
  const result = await activeScanner(user, queryOptions);

  // Update the user.
  await usersDB.updateUser(user);

  if (result)
    return res.status(200).send({
      success: true,
      message: 'The jobs scanner was finished successfully',
      code: MESSAGE_CODES.SCANNER_SUCCESS,
    });
  else
    return res
      .status(500)
      .send({ message: 'Something went wrong', success: false, code: MESSAGE_CODES.SOMETHING_WRONG });
};
