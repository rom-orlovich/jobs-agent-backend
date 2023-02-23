import axios from 'axios';

import { JobsDB } from '../../../lib/jobsDB';

import { GoogleTranslate } from '../googleTranslate/googleTranslate';

import { Job, JobPost } from '../jobsScanner.types';
import { throatPromises, untilSuccess } from '../../../lib/utils';
import { Page } from 'puppeteer';
import { UserEntity } from '../user/userEntity.types';
import { ScannerName } from '../generalQuery/query.types';
import { RequirementsReader } from '../requirementsReader/requirementsReader';

export class Scanner {
  user: UserEntity;
  googleTranslate: GoogleTranslate;
  scannerName: ScannerName;
  jobMap = new Map();
  jobsDB: JobsDB;

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

  protected filterJobsPosts<JP extends Job>() {
    return (curJob: JP) => {
      if (this.jobMap.get(curJob.jobID)) return false;
      else this.jobMap.set(curJob.jobID, true);
      if (!curJob.link || !curJob.jobID || !curJob.title) return false;
      return true;
    };
  }

  protected async filterJobsExistInDB<JP extends Job>(jobsPosts: JP[], hash: string) {
    const filterResults = [];
    for (const jobPost of jobsPosts) {
      const isExist = await this.jobsDB.updateOne(jobPost.jobID, hash);
      if (!isExist) filterResults.push(jobPost);
    }

    return filterResults;
  }

  static async waitUntilScan(page: Page, url: string, selector: string) {
    if (!url) return;
    await untilSuccess(async () => {
      await page.goto('https://google.com/', { waitUntil: 'load' });
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForSelector(selector, { timeout: 3000 });
    });
  }

  protected async getTranslateResultsScanning(
    promises: Promise<JobPost[]>[],
    throatNum = 10
  ): Promise<JobPost[]> {
    const jobsPosts = (await Promise.all(throatPromises(throatNum, promises))).flat(1);
    const jobsPostsWithTranslate = await this.googleTranslate.translateArrayText(jobsPosts);

    return jobsPostsWithTranslate;
  }

  async scanning(): Promise<JobPost[]> {
    throw new Error('Method not implemented.');
  }

  async insertManyDB(jobsPosts: JobPost[], hash: string) {
    await this.jobsDB.insertMany(
      jobsPosts.map((el) => ({ ...el, hashQueries: [hash], createdAt: new Date() }))
    );
  }

  filterResults(jobsPosts: JobPost[]) {
    return RequirementsReader.checkRequirementMatchForArray(jobsPosts, this.user);
  }

  async getResults(): Promise<JobPost[]> {
    const jobsPosts = await this.scanning();
    console.log(`finish found ${jobsPosts.length} jobs in ${this.scannerName}`);
    if (jobsPosts.length) await this.insertManyDB(jobsPosts, this.user.getLastHashQuery());

    return this.filterResults(jobsPosts);
  }
}
