import { Collection } from 'mongodb';
import { mongoDB } from '..';
import { Job, JobPost } from '../src/JobsScanner/jobsScanner';

export class JobsDB {
  jobs: Collection;
  constructor() {
    this.jobs = mongoDB.createDBcollection('jobDB', 'jobs');
    this.jobs.createIndex({ addedAt: 1 }, { expireAfterSeconds: 60 * 60 });
  }
  async getJob(jobID: string) {
    try {
      const job = await this.jobs?.findOne<Job>({
        jobID,
      });

      return job ? job : undefined;
    } catch (error) {
      return undefined;
    }
  }
  async getJobsByHash(hash: string) {
    try {
      const job = this.jobs?.aggregate<JobPost>([
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
  async insertOne(job: Job) {
    try {
      const insert = await this.jobs.insertOne(job);
      return insert;
    } catch (error) {
      console.log(error);
    }
  }
  async updateOne(jobID: string, hash: string) {
    try {
      const update = await this.jobs.updateOne(
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
      const insert = await this.jobs.insertMany(jobs);
      return insert;
    } catch (error) {
      console.log(error);
    }
  }
}
