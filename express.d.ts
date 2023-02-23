import { UsersDB } from './lib/usersDB';
import { User } from './src/jobsScanner/user/user';
import { Express } from 'express';
export {};
declare global {
  declare namespace Express {
    export interface Request {
      validateBeforeScanner: {
        user: User;
        usersDB: UsersDB;
        // searchAll: boolean;
      };
    }
  }
}
