import axios from 'axios';

import { JobsDB } from '../../../mongoDB/jobsDB/jobsDB';

import { GoogleTranslate } from '../googleTranslate/googleTranslate';

import { throatPromises, untilSuccess } from '../../../lib/utils';
import { Page } from 'puppeteer';
import { UserEntity } from '../user/userEntity.types';
import { ScannerName } from '../generalQuery/query.types';
import { RequirementsReader } from '../requirementsReader/requirementsReader';
import { Job } from '../../../mongoDB/jobsDB/jobsDB.types';

export class Scanner {
  user: UserEntity;
  googleTranslate: GoogleTranslate;
  scannerName: ScannerName;
  jobMap = new Map();
  jobsDB: JobsDB;
  static THROAT_LIMIT = process.env.THROAT_LIMIT || 3;
  static SLOW_MOV = process.env.SLOW_MOV || 250;
  static TIMEOUT_TRY = process.env.TIMEOUT_TRY || 3000;

  constructor(scannerName: ScannerName, user: UserEntity, jobsDB: JobsDB) {
    this.user = user;
    this.googleTranslate = new GoogleTranslate({ op: 'translate', from: 'he', to: 'en' });
    this.scannerName = scannerName;
    this.jobsDB = jobsDB;
  }

  getURL(...args: any[]): string {
    throw new Error('Method not implemented.');
  }

  protected async getAxiosData<D>(page: number): Promise<D | undefined> {
    const url = this.getURL(page);
    console.log(url);
    try {
      const res = await axios(url);
      const data = res.data;
      return data;
    } catch (error) {
      return undefined;
    }
  }

  protected filterJobs<JP extends Job>() {
    return (curJob: JP) => {
      if (this.jobMap.get(curJob.jobID)) return false;
      else this.jobMap.set(curJob.jobID, true);
      if (!curJob.link || !curJob.jobID || !curJob.title) return false;
      return true;
    };
  }

  protected async filterJobsExistInDB<JP extends Job>(jobs: JP[], hash: string) {
    const filterResults = [];
    for (const jobPost of jobs) {
      const isExist = await this.jobsDB.updateOne(jobPost.jobID, hash);
      if (!isExist) filterResults.push(jobPost);
    }

    return filterResults;
  }

  static async waitUntilScan(page: Page, url: string, selector: string) {
    if (!url) return;
    await untilSuccess()(async () => {
      await page.goto('https://google.com/', { waitUntil: 'load' });
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForSelector(selector, { timeout: Scanner.TIMEOUT_TRY });
    });
  }

  protected async getTranslateResultsScanning(
    promises: Promise<Job[]>[],
    throatNum = Scanner.THROAT_LIMIT
  ): Promise<Job[]> {
    const jobs = (await Promise.all(throatPromises(throatNum, promises))).flat(1) || [];
    const jobsPostsWithTranslate = await this.googleTranslate.translateArrayText(jobs);

    return jobsPostsWithTranslate;
  }

  async scanning(): Promise<Job[]> {
    throw new Error('Method not implemented.');
  }

  async insertManyDB(jobs: Job[], hash: string) {
    await this.jobsDB.insertMany(
      jobs.map((el) => ({ ...el, hashQueries: [hash], createdAt: new Date() }))
    );
  }

  filterResults(jobs: Job[]) {
    return RequirementsReader.checkRequirementMatchForArray(jobs, this.user);
  }

  async getResults(): Promise<Job[]> {
    const jobs = await this.scanning();
    console.log(`finish found ${jobs.length} jobs in ${this.scannerName}`);
    if (jobs.length) await this.insertManyDB(jobs, this.user.getLastHashQuery());

    return jobs;
  }
}
