import { Collection } from 'mongodb';
import { mongoDB } from '..';
import { Job, JobPost } from '../src/JobsScanner/jobsScanner';
import { EXPIRE_AT_MONGO_DB } from './HashQuery';

export class JobsDB {
  jobsDB: Collection;
  constructor() {
    this.jobsDB = mongoDB.createDBcollection('job-agent-db', 'Jobs');
    this.jobsDB.createIndex({ addedAt: 1 }, { expireAfterSeconds: EXPIRE_AT_MONGO_DB });
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

  async getJobsByHash(hash: string) {
    try {
      const job = this.jobsDB?.aggregate<JobPost>([
        { $match: { hashes: { $elemMatch: { $eq: hash } } } },
        {
          $project: { hashes: 0, addedAt: 0, _id: 0 },
        },
      ]);

      return await job.toArray();
    } catch (error) {
      return [];
    }
  }

  async getJobsByHashQueries(hashes: string[]) {
    try {
      const job = this.jobsDB?.aggregate<JobPost>([
        { $match: { hashes: { $elemMatch: { $in: hashes } } } },
        {
          $project: { hashes: 0, addedAt: 0, _id: 0 },
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
        { $set: { addedAt: new Date() }, $addToSet: { hashes: hash } }
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
