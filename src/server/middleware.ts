import { RequestHandler } from 'express';
import { GenericRecord } from '../../lib/types';
import { UsersDB } from '../../lib/usersDB';

export const checkString = (str: unknown) => typeof str === 'string';
export const checkValidNumber = (num: unknown) => Number.isFinite(num);

// Check the userID is valid number.
const checkUserIDisNumber = (userID: unknown) => {
  if (typeof userID !== 'string') return undefined;
  const userIDisNumber = Number.parseInt(userID);
  if (userIDisNumber) return userID;
};

//Check the SearchAll is valid boolean.
const checkSearchAllIsBoolean = (searchAll: unknown) => {
  if (typeof searchAll !== 'string') return undefined;
  const searchAllObj: GenericRecord<boolean> = {
    true: true,
    false: false,
  };
  return searchAllObj[searchAll];
};

//Check query has valid query key value
const checkValidQuery = (query: GenericRecord<any>) => {
  const checkStrValueByKey = (key: string) => query[key] !== undefined && checkString(query[key]);
  const checkNumValueByKey = (key: string) => query[key] !== undefined && checkValidNumber(query[key]);
  if (!checkStrValueByKey('hash')) return false;
  if (!checkStrValueByKey('title')) return false;
  if (!checkStrValueByKey('from')) return false;
  if (!checkStrValueByKey('reason')) return false;
  if (!checkNumValueByKey('limit')) return false;
  if (!checkNumValueByKey('page')) return false;

  return true;
};

//initial the usersDB and load the requested user from the DB.
const initialUsersAndLoadUserFromDB = async (userID: string) => {
  const usersDB = new UsersDB();
  const user = await usersDB.loadUser(userID);
  return { usersDB, user };
};

export const validateBeforeScanner: RequestHandler = async (req, res, next) => {
  // Check the userID is valid number.
  const userID = checkUserIDisNumber(req.params.userID);
  if (!userID) return res.status(400).send({ message: 'Please enter a valid userID.' });

  // Check the url queries are valid.
  if (!checkValidQuery(req.query))
    return res.status(400).send({ message: 'Please enter valid url queries.' });

  // //Check the SearchAll is valid.
  // const searchAll = checkSearchAllIsBoolean(req.query.SearchAll);
  // if (searchAll === undefined)
  //   return res.status(400).send({ message: 'Please enter a valid active query' });

  //initial the usersDB and load the requested user from the DB.
  const { user, usersDB } = await initialUsersAndLoadUserFromDB(userID);
  if (!user) return res.status(400);
  req.validateBeforeScanner = {
    user,
    usersDB,
  };

  next();
};
