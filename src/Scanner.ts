import axios from 'axios';

import Cluster, { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import throat from 'throat';
import { GeneralQuery, ScannerName, UserInput } from '../lib/GeneralQuery';

import { JobsDB } from '../lib/JobsDB';
import { Profile } from '../lib/Profile';
import { JobPost } from './AllJobScanner';
import { GoogleTranslate } from './GoogleTranslateScanner';

export interface TaskProps {
  profile: Profile;
  JobsDB: JobsDB;
  cluster?: Cluster;
}

export interface ScannerAPI {
  profile: Profile;
  getURL(pageNum?: number, ...args: any[]): string;
  getAxiosData<D>(page: number): Promise<D | undefined>;
}
export class Scanner implements ScannerAPI {
  profile: Profile;
  googleTranslate: GoogleTranslate;
  scannerName: ScannerName;

  constructor(scannerName: ScannerName, userInput: UserInput, profile: Profile) {
    this.profile = profile;
    this.googleTranslate = new GoogleTranslate({ op: 'translate', from: 'he', to: 'en' }, profile);
    this.scannerName = scannerName;
  }

  getURL(pageNum?: number, ...args: any[]): string {
    throw new Error('Method not implemented.');
  }

  async getAxiosData<D>(page: number): Promise<D | undefined> {
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
  async getResultScanning(promises: Promise<JobPost[]>[], throatNum = 10) {
    const jobsPosts = (await Promise.all(promises.map(throat(throatNum, (el) => el)))).flat(1);
    console.log(`finish found ${jobsPosts.length} jobs in ${this.scannerName}`);
    const jobs = await this.googleTranslate.checkJobRequirements(jobsPosts);
    return jobs;
  }
}
