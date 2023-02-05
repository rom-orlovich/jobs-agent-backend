import { Page } from 'puppeteer';
import Cluster, { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { JobsDB } from '../lib/JobsDB';
import { Profile } from '../lib/Profile';

export interface TaskProps {
  profile: Profile;
  JobsDB: JobsDB;
  cluster?: Cluster;
}

export interface ScannerAPI<T, K, R = unknown> {
  queryOptions: T;
  getURL(page?: number): string;

  getHTML(page: number): Promise<string>;
  taskCreator(): TaskFunction<K, R>;
  scanning(profile: Profile, preJobs: R): Promise<R>;
}
export class Scanner<T, K, R> implements ScannerAPI<T, K, R> {
  queryOptions: T;
  constructor(queryOptions: T) {
    this.queryOptions = queryOptions;
  }

  getURL(page?: number): string {
    throw new Error('Method not implemented.');
  }

  async getHTML(page: number): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async scanning(profile: Profile, preJobs: R): Promise<R> {
    throw new Error('Method not implemented.');
  }

  async noImageRequest(page: Page) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image') {
        req.abort();
      } else {
        req.continue();
      }
    });
  }
  // async initPuppeteer(page: Page): Promise<R> {
  //   throw new Error('Method not implemented.');
  // }

  taskCreator(): TaskFunction<K, R> {
    throw new Error('Method not implemented.');
  }
}
