import { Collection } from 'mongodb';
import { mongoDB } from '..';
import { Job } from './types/linkedinScrapper';

export class JobsDb {
  jobs: Collection;
  constructor() {
    this.jobs = mongoDB.createDBcollection('jobDB', 'jobs');
  }
  async getJob(jobID: string) {
    try {
      const job = await this.jobs?.findOne({ jobID: jobID });

      return job ? job : undefined;
    } catch (error) {
      return undefined;
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
}
