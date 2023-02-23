import { RequestHandler } from 'express';
import { GenericRecord } from '../../lib/types';
import { UsersDB } from '../../lib/usersDB';

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

//initial the usersDB and load the requested user from the DB.
const initialUsersAndLoadUserFromDB = async (userID: string) => {
  const usersDB = new UsersDB();
  const user = await usersDB.loadUser(userID);
  return { usersDB, user };
};

export const validateBeforeScanner: RequestHandler = async (req, res, next) => {
  // Check the userID is valid number.
  const userID = checkUserIDisNumber(req.params.userID);
  if (!userID) return res.status(400).send({ message: 'Please enter a valid userID' });

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
    // searchAll: searchAll,
  };

  next();
};
