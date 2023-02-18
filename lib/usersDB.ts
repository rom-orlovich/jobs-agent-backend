import { Collection, ObjectId } from 'mongodb';
import { mongoDB } from '../src/server';

import { User } from '../src/jobsScanner/user/user';
import { UserEntity, UserOptions } from '../src/jobsScanner/user/userEntity';

export class UsersDB {
  users: Collection;
  constructor() {
    this.users = mongoDB.createDBcollection('job-agent-db', 'Users');
  }

  async addUser({
    hashQueries,
    blackList,
    excludedRequirements,
    requirements,
    overallEx,
  }: InstanceType<typeof User>) {
    try {
      const result = await this.users.insertOne({
        hashQueries,
        blackList,
        excludedRequirements,
        requirements,
        overallEx,
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  // async updateHashQuery(hash: InstanceType<typeof HashQuery>, userID = 1) {
  //   try {
  //     const result = await this.users.updateOne({ userID }, { $ });
  //     return result;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  async loadUser(userID: string) {
    try {
      const result = await this.users.findOne<UserOptions>({
        userID: userID,
      });
      console.log(result);
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
        user
      );
      if (!result) return undefined;
      // const user = new User(result);
      return result.modifiedCount;
    } catch (error) {
      return undefined;
    }
  }

  async getUserJobsByQueryHashes(userID: string) {
    // const aggregates: Document[] = [{ $match: { user }  }];
    this.users.aggregate([
      { $match: { _id: new ObjectId(userID) } },
      // { $project: { _id: 0, hashQueries: 1 } },
      {
        $lookup: {
          from: 'jobs',
          let: { hashes: '$hashes' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $setIsSubset: [
                    '$hashes',
                    {
                      $map: {
                        input: '$$hashQueries',
                        as: 'userHash',
                        in: '$$userHash.hash',
                      },
                    },
                  ],
                },
              },
            },
          ],
          as: 'jobs',
        },
      },
      { $project: { _id: 0, jobs: 1 } },
    ]);
  }
}
