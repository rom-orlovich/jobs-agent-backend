import { Collection } from 'mongodb';
import { mongoDB } from '../src/server';
import { Job, JobPost } from '../src/jobsScanner/jobsScanner';
import { EXPIRE_AT_MONGO_DB } from '../src/jobsScanner/user/hashQuery';

export class JobsDB {
  jobsDB: Collection;
  constructor() {
    this.jobsDB = mongoDB.createDBcollection('jobs-agent-db', 'jobs');
  }

  async createTTLindex() {
    try {
      const indexesArr = await this.jobsDB.indexExists('jobs_ttl_index');
      if (!indexesArr) {
        console.log('create Index');
        await this.jobsDB.createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: EXPIRE_AT_MONGO_DB, name: 'jobs_ttl_index' }
        );
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

  async getJobsByHash(hash: string) {
    try {
      const job = this.jobsDB?.aggregate<JobPost>([
        { $match: { hashQueries: { $elemMatch: { $eq: hash } } } },
        {
          $project: { hashQueries: 0, createdAt: 0, _id: 0 },
        },
      ]);

      return await job.toArray();
    } catch (error) {
      return [];
    }
  }

  async getJobsByHashQueries(hashQueries: string[]) {
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
