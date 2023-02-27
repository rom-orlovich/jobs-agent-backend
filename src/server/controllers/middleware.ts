import { RequestHandler } from 'express';

import { UsersDB } from '../../../mongoDB/usersDB';
import { ERROR_CODES } from '../lib/errorCodes';
import { QueryValidation } from '../lib/queryValidation';

export const checkString = (str: unknown) => typeof str === 'string';
export const checkValidNumber = (num: unknown) => Number.isFinite(num);

//initial the usersDB and load the requested user from the DB.
const initialUsersAndLoadUserFromDB = async (userID: string) => {
  const usersDB = new UsersDB();
  const user = await usersDB.loadUser(userID);

  return { usersDB, user };
};

export const validateBeforeScanner: RequestHandler = async (req, res, next) => {
  // Check the userID is valid number and only number.
  const userID = QueryValidation.checkString(req.params.userID);
  if (!userID)
    return res.status(400).send({
      message: 'Please enter a valid userID.',
      success: false,
      code: ERROR_CODES.USER_ID_NOT_VALID,
    });
  const queryValidation = new QueryValidation(req.query);
  console.log(
    '🚀 ~ file: middleware.ts:79 ~ constvalidateBeforeScanner:RequestHandler= ~ req.query:',
    req.query
  );

  // Check the url queries are valid.
  if (!queryValidation.resultQueryOptions)
    return res.status(400).send({
      message: 'Please enter valid url queries.',
      success: false,
      code: ERROR_CODES.ENTER_VALID_QUERY,
    });

  const isHashString = QueryValidation.checkString(req.query.hash);

  const hash = isHashString ? isHashString : undefined;

  //initial the usersDB and load the requested user from the DB.
  const { user, usersDB } = await initialUsersAndLoadUserFromDB(String(userID));

  if (!user)
    return res
      .status(400)
      .send({ message: 'User is not found.', success: false, code: ERROR_CODES.USER_NOT_FOUND });

  req.validateBeforeScanner = {
    user,
    usersDB,
    queryOptions: queryValidation.resultQueryOptions,
    hash: hash,
  };

  return next();
};
