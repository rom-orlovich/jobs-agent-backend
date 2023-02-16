import { Collection, Document, ObjectId } from 'mongodb';
import { mongoDB } from '../src/server';
import { HashQuery } from '../src/jobsScanner/user/hashQuery';
import { UserOptions } from '../src/jobsScanner/user/user';
import { User } from '../src/jobsScanner/user/user';

export class UsersDB {
  users: Collection;
  constructor() {
    this.users = mongoDB.createDBcollection('job-agent-db', 'Users');
  }

  async addUser({
    hashQueries,
    blackList,
    excludeTechs,
    requirements,
    overallEx,
  }: InstanceType<typeof User>) {
    try {
      const result = await this.users.insertOne({
        hashQueries,
        blackList,
        excludeTechs,
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
        _id: new ObjectId(userID),
      });
      if (!result) return undefined;
      const user = new User(result);
      return user;
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
