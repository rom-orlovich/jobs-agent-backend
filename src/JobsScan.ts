import { Profile } from '../lib/Profile';
import { Query } from '../lib/Query';
import { Job } from '../lib/types/linkedinScrapper';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { LinkedinScan } from './LinkedinScan';
import { PuppeteerDOM } from '../lib/PuppeteerDOM';

export interface Log {
  logID: string;
  title: string;
  link: string;
  reason: string;
}
export class JobsScan {
  queryOptions: Query;
  profile: Profile;
  puppeteerDOM: PuppeteerDOM;
  linkedinScanner: LinkedinScan;

  constructor(profile: Profile, queryOptions: Query) {
    this.queryOptions = queryOptions;

    this.profile = profile;
    this.puppeteerDOM = new PuppeteerDOM(profile);
    this.linkedinScanner = new LinkedinScan(this.queryOptions);
  }

  _createPathPotentialJobsJSON() {
    return path.join(__dirname, '../', 'JSON', `jobs.json`);
  }

  _createPathLogsJobJSON() {
    return path.join(__dirname, '../', 'logs', 'job-logs.json');
  }

  //Todo: move these function to fs class.
  async loadJSON<T>(path: string): Promise<T[]> {
    try {
      return JSON.parse(await readFile(path, 'utf8'));
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async _writeJSON<T>(data: T, path: string) {
    try {
      await writeFile(path, JSON.stringify(data), 'utf-8');
      console.log(`finish create json file in ${path}`);
    } catch (error) {
      console.log(error);
    }
  }

  async scanning() {
    const pathJobs = this._createPathPotentialJobsJSON();
    const pathLogs = this._createPathLogsJobJSON();
    let potentialJobs = await this.loadJSON<Job>(pathJobs);
    let jobLogs = await this.loadJSON<Log>(pathLogs);
    const { curJobs, curLogs } = await this.linkedinScanner.scanning(
      this.puppeteerDOM,
      this.queryOptions,
      potentialJobs,
      jobLogs
    );
    potentialJobs = [...potentialJobs, ...curJobs];
    jobLogs = [...jobLogs, ...curLogs];
    console.log('finish fetch jobs');
    await this._writeJSON(potentialJobs, pathJobs);
    await this._writeJSON(jobLogs, pathLogs);
  }
}
