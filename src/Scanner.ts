import axios from 'axios';

import Cluster, { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import throat from 'throat';

import { JobsDB } from '../lib/JobsDB';
import { Profile } from '../lib/Profile';
import { JobPost } from './AllJobScanner';
import { GoogleTranslate } from './GoogleTranslateScanner';

export interface TaskProps {
  profile: Profile;
  JobsDB: JobsDB;
  cluster?: Cluster;
}

export interface ScannerAPI<T, K, R = unknown> {
  queryOptions: T;
  profile: Profile;
  getURL(pageNum?: number, ...args: any[]): string;
  getAxiosData<D>(page: number): Promise<D | undefined>;
  taskCreator(): TaskFunction<K, R>;
  // scanning(preJobs: R): Promise<R[]>;
}
export class Scanner<T, K, R> implements ScannerAPI<T, K, R> {
  queryOptions: T;
  profile: Profile;
  googleTranslate: GoogleTranslate;
  scannerName: string;

  constructor(scannerName: string, queryOptions: T, profile: Profile) {
    this.queryOptions = queryOptions;
    this.profile = profile;
    this.googleTranslate = new GoogleTranslate({ op: 'translate', from: 'he', to: 'en' }, profile);
    this.scannerName = scannerName;
  }

  getURL(pageNum?: number, ...args: any[]): string {
    throw new Error('Method not implemented.');
  }

  async getAxiosData<D>(page: number): Promise<D | undefined> {
    console.log(this.getURL(page));
    try {
      const res = await axios(this.getURL(page));
      const data = res.data;
      return data;
    } catch (error) {
      return undefined;
    }
  }
  async getResultScanning(promises: Promise<JobPost[]>[], throatNum = 10) {
    const jobsPosts = (await Promise.all(promises.map(throat(throatNum, (el) => el)))).flat(1);
    console.log(`finish found ${jobsPosts.length} jobs in ${this.scannerName}`);
    const jobs = await this.googleTranslate.translateJobTexts(jobsPosts);
    return jobs;
  }

  taskCreator(): TaskFunction<K, R> {
    throw new Error('Method not implemented.');
  }
}
