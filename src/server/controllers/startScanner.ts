import { RequestHandler } from 'express';
import { UsersDB } from 'mongoDB/usersDB';
import { JobsScanner } from 'src/jobsScanner/jobsScanner';
import { User } from 'src/jobsScanner/user/user';
import { ERROR_CODES } from '../lib/errorCodes';
import { QueryOptionsRes } from '../lib/queryValidation';

const activeScanner = async (user: User, userDB: UsersDB, queryOptions: QueryOptionsRes) => {
  try {
    const jobsScanner = new JobsScanner(user, queryOptions);
    await userDB.updateUser(user);
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
  const { user, usersDB, queryOptions } = req.validateBeforeScanner;
  //Active the scanner.

  const result = await activeScanner(user, usersDB, queryOptions);
  if (result)
    return res.status(200).send({
      success: true,
      message: 'The jobs scanner was finished successfully',
      code: ERROR_CODES.SCANNER_SUCCESS,
    });
  else
    return res
      .status(500)
      .send({ message: 'Something went wrong', success: false, code: ERROR_CODES.SOMETHING_WRONG });
};
