import { UsersDB } from '../mongoDB/usersDB';
import { User } from '../src/jobsScanner/user/user';
import Express from 'express';
import { QueryOptionsRes } from '../src/server/lib/queryValidation';

declare global {
  declare namespace Express {
    export interface Request {
      validateBeforeScanner: {
        user: User;
        usersDB: UsersDB;
        queryOptions: QueryOptionsRes;
        hash?: string;
      };
    }
  }
}
export {};
