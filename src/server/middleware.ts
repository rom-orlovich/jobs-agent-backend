import { RequestHandler } from 'express';
import { GenericRecord } from '../../lib/types';
import { UsersDB } from '../../mongoDB/usersDB';
import { ERROR_CODES } from './errorCodes';
import { QueryValidation } from './queryValidation';

const possiblesKeys: GenericRecord<boolean> = {
  hash: true,
  title: true,
  from: true,
  reason: true,
  limit: true,
  page: true,
};

export const checkString = (str: unknown) => typeof str === 'string';
export const checkValidNumber = (num: unknown) => Number.isFinite(num);

// Check the userID is valid number.
// const checkUserIDisNumber = (userID: unknown) => {
//   if (typeof userID !== 'string') return undefined;
//   const userIDisNumber = Number.parseInt(userID);
//   if (userIDisNumber) return userID;
// };

// //Check the SearchAll is valid boolean.
// const checkSearchAllIsBoolean = (searchAll: unknown) => {
//   if (typeof searchAll !== 'string') return undefined;
//   const searchAllObj: GenericRecord<boolean> = {
//     true: true,
//     false: false,
//   };
//   return searchAllObj[searchAll];
// };

// //Check query has valid query key value
// const checkValidQuery = (query: GenericRecord<any>) => {
//   //Helpers functions that check if query keyValue is valid input.
//   //Key is valid if it exist in possibleKeys object and if it valid string or valid number.
//   const checkValidKeyValue = (key: string) =>
//     (possiblesKeys[key] && checkString(query[key])) || checkValidNumber(query[key]);

//   const queryKeysArr = Object.keys(query);
//   //Check forEach query keys if it valid key.
//   const checkValidQueryKey = queryKeysArr.some((key) => checkValidKeyValue(key));
//   if (!checkValidQueryKey) return false;

//   // if (!checkStrValueByKey('hash'))

//   // if (!checkStrValueByKey('title')) return false;
//   // if (!checkStrValueByKey('from')) return false;
//   // if (!checkStrValueByKey('reason')) return false;
//   // if (!checkNumValueByKey('limit')) return false;
//   // if (!checkNumValueByKey('page')) return false;
//   // const possiblesKeysArr = Object.keys(possiblesKeys);
//   // if (possiblesKeysArr.some((key) => !possiblesKeys[key])) return false;

//   return true;
// };

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
  console.log(
    '🚀 ~ file: middleware.ts:79 ~ constvalidateBeforeScanner:RequestHandler= ~ queryValidation:',
    queryValidation
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
