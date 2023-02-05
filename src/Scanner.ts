import axios from 'axios';
import { Page } from 'puppeteer';
import Cluster, { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import throat from 'throat';
import { JobsDB } from '../lib/JobsDB';
import { Profile } from '../lib/Profile';
import { PuppeteerSetup } from '../lib/PuppeteerSetup';
import { RequirementsReader } from '../lib/RequirementsReader';
import { JobPost } from './AllJobScanner';
import { GoogleTranslateScanner } from './GoogleTranslateScanner';

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
  scanning(preJobs: R): Promise<R>;
}
export class Scanner<T, K, R> implements ScannerAPI<T, K, R> {
  queryOptions: T;
  profile: Profile;
  googleTranslate: GoogleTranslateScanner;

  constructor(queryOptions: T, profile: Profile) {
    this.queryOptions = queryOptions;
    this.profile = profile;
    this.googleTranslate = new GoogleTranslateScanner(
      { to: 'en', from: 'he', op: 'translate' },
      profile
    );
  }

  getURL(pageNum?: number, ...args: any[]): string {
    throw new Error('Method not implemented.');
  }

  getReason(text: string) {
    return RequirementsReader.checkIsRequirementsMatch(text, this.profile).reason;
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

  async translateText(jobsPosts: JobPost[]) {
    const { browser } = await PuppeteerSetup.lunchInstance({ headless: false });
    const promises = jobsPosts.map(
      throat(5, async ({ text, ...job }) => {
        const newPage = await browser.newPage();
        const translateText = await this.googleTranslate.goTranslate(newPage, text);
        await newPage.close();

        return {
          ...job,
          reason: this.getReason(translateText),
        };
      })
    );

    const jobs = await Promise.all(promises);
    await browser.close();
    return jobs;
  }

  async scanning(preJobs: R): Promise<R> {
    throw new Error('Method not implemented.');
  }

  taskCreator(): TaskFunction<K, R> {
    throw new Error('Method not implemented.');
  }
}
