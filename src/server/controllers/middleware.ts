import { RequestHandler } from 'express';

import { UsersDB } from '../../../mongoDB/usersDB';
import { getMessageCode } from '../lib/messageCodes';
import { QueryValidation } from '../lib/queryValidation';

export const checkString = (str: unknown) => typeof str === 'string';
export const checkValidNumber = (num: unknown) => Number.isFinite(num);

//initial the usersDB and load the requested user from the DB.
const initialUsersAndLoadUserFromDB = async (userID: string, activeHash?: string) => {
  const usersDB = new UsersDB();
  const user = await usersDB.loadUser(userID, activeHash);

  return { usersDB, user };
};

export const validateBeforeScanner: RequestHandler = async (req, res, next) => {
  // Check the userID is valid number and only number.
  const userID = QueryValidation.checkString(req.params.userID);
  if (!userID)
    return res.status(400).send({
      code: getMessageCode('USER_ID_NOT_VALID'),
      success: false,
    });
  const queryValidation = new QueryValidation(req.query);

  // Check the url queries are valid.
  if (!queryValidation.resultQueryOptions)
    return res.status(400).send({
      code: getMessageCode('URL_QUERY_NOT_VALID'),
      success: false,
    });

  const isHashString = QueryValidation.checkString(req.query.hash);

  const hash = isHashString ? isHashString : undefined;

  //initial the usersDB and load the requested user from the DB.
  const { user, usersDB } = await initialUsersAndLoadUserFromDB(String(userID), hash);

  if (!user) return res.status(404).send({ success: false, code: getMessageCode('USER_IS_FOUND') });

  const lastQuery = user.getLastQuery();
  if (!lastQuery)
    return res.status(404).send({ success: false, code: getMessageCode('USER_QUERY_NOT_FOUND') });

  if (!lastQuery.position)
    return res
      .status(400)
      .send({ success: false, code: getMessageCode('USER_PROFILE_FORM_POSITION_IS_NOT_VALID') });

  if (!lastQuery.location)
    return res
      .status(400)
      .send({ success: false, code: getMessageCode('USER_PROFILE_FORM_LOCATION_IS_NOT_VALID') });

  req.validateBeforeScanner = {
    user,
    usersDB,
    queryOptions: queryValidation.resultQueryOptions,
    hash: hash,
  };

  return next();
};
