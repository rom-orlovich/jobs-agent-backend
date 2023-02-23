import { Collection } from 'mongodb';
import { mongoDB } from '../src/server';
import { Job, JobPost } from '../src/jobsScanner/jobsScanner.types';
import { EXPIRE_AT_MONGO_DB } from '../src/jobsScanner/user/UserQuery';

export class JobsDB {
  jobsDB: Collection;
  constructor() {
    this.jobsDB = mongoDB.createDBcollection('jobs-agent-db', 'jobs');
  }

  /**
   * Create ttl(Time to live) index for jobs collections.
   * Check if the ttl index is exist. If it doesn't create one.
   * Otherwise, print appropriate message.
   */
  async createTTLindex() {
    try {
      const indexesArr = await this.jobsDB.indexExists('createdAt_1');
      if (!indexesArr) {
        console.log('create Index');
        await this.jobsDB.createIndex({ createdAt: 1 }, { expireAfterSeconds: EXPIRE_AT_MONGO_DB });
      } else {
        console.log('Index ttl is exist');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getJob(jobID: string) {
    try {
      const job = await this.jobsDB?.findOne<Job>({
        jobID,
      });

      return job ? job : undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * @param {string} hashQuery that represent the user's query object.
   * @returns {Promise<JobPost[]>} All user's jobsPosts that match the user's hashQueries.
   */
  async getJobsByHash(hashQuery: string): Promise<JobPost[]> {
    try {
      const jobsPosts = this.jobsDB?.aggregate<JobPost>([
        { $match: { hashQueries: { $elemMatch: { $eq: hashQuery } } } },
        {
          $project: { hashQueries: 0, createdAt: 0, _id: 0 },
        },
      ]);

      return await jobsPosts.toArray();
    } catch (error) {
      return [];
    }
  }

  /**
   * Gets all the jobsPosts that match the user history queries by their current hashQueries array.
   * @param {string[]} hashQueries  User's HashQueries string array.
   * @returns {Promise<JobPost[]>} All user's jobsPosts that match the user's hashQueries array.
   */
  async getJobsByHashQueries(hashQueries: string[]): Promise<JobPost[]> {
    try {
      const job = this.jobsDB?.aggregate<JobPost>([
        { $match: { hashQueries: { $elemMatch: { $in: hashQueries } } } },
        {
          $project: { hashQueries: 0, createdAt: 0, _id: 0 },
        },
      ]);

      return await job.toArray();
    } catch (error) {
      return [];
    }
  }

  async insertOne(job: Job) {
    try {
      const insert = await this.jobsDB.insertOne(job);
      return insert;
    } catch (error) {
      console.log(error);
    }
  }
  async updateOne(jobID: string, hash: string) {
    try {
      const update = await this.jobsDB.updateOne(
        { jobID },
        { $set: { createdAt: new Date() }, $addToSet: { hashQueries: hash } }
      );
      return update.modifiedCount;
    } catch (error) {
      return;
    }
  }
  async insertMany(jobs: JobPost[]) {
    try {
      const insert = await this.jobsDB.insertMany(jobs);
      return insert;
    } catch (error) {
      console.log(error);
    }
  }
}
