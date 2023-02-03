import { Page } from 'puppeteer';
import Cluster, { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { JobsDb } from '../lib/JobsDB';
import { Profile } from '../lib/Profile';

export interface TaskProps {
  profile: Profile;
  jobs: JobsDb;
  cluster?: Cluster;
}

export interface ScannerAPI<T, K, R = unknown> {
  //   getURL?: () => string;
  queryOptions: T;
  delay(ms: number): Promise<unknown>;
  taskCreator(): TaskFunction<K, R>;
}
export class Scanner<T, K, R> implements ScannerAPI<T, K, R> {
  queryOptions: T;
  constructor(queryOptions: T) {
    this.queryOptions = queryOptions;
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  taskCreator(): TaskFunction<K, R> {
    throw new Error('Method not implemented.');
  }
}
