import { Collection } from 'mongodb';
import { mongoDB } from '../src/server';

import { User } from '../src/jobsScanner/user/user';
import { UserEntity, UserProfile } from '../src/jobsScanner/user/userEntity.types';

export class UsersDB {
  users: Collection;
  constructor() {
    this.users = mongoDB.createDBcollection('jobs-agent-db', 'users');
  }

  async loadUser(userID: string) {
    try {
      const result = await this.users.findOne<UserProfile>({
        userID: userID,
      });

      if (!result) return undefined;
      const user = new User(result);
      return user;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async updateUser(user: UserEntity) {
    try {
      const result = await this.users.updateOne(
        {
          userID: user.userID,
        },
        { $set: user }
      );
      console.log(result);
      if (!result) return undefined;

      return result.modifiedCount;
    } catch (error) {
      return undefined;
    }
  }
}
