import Cluster, { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { JobsDb } from '../lib/JobsDB';
import { Profile } from '../lib/Profile';
import { Job } from '../lib/types/linkedinScrapper';

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

  taskCreator(): TaskFunction<K, R> {
    throw new Error('Method not implemented.');
  }
}
