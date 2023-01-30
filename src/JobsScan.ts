import { Profile } from '../lib/Profile';
import { Query } from '../lib/Query';
import { Job } from '../lib/types/linkedinScrapper';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { LinkedinScan } from './LinkedinScan';
import { PuppeteerDOM } from '../lib/PuppeteerDOM';
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

  private createFileName() {
    // const date = new Date().toLocaleDateString().split('/').join('-');
    const jobQuery = this.queryOptions.jobQuery.split(' ').join('-').toLowerCase();
    const fileName = `${jobQuery}.json`;
    return fileName;
  }
  private createPathJSON() {
    return path.join(__dirname, '../', 'JSON', this.createFileName());
  }

  //Todo: move these function to fs class.
  async loadJSON<T>(): Promise<T[]> {
    try {
      const path = this.createPathJSON();
      return JSON.parse(await readFile(path, 'utf8'));
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async writeJSON(jobs: Job[]) {
    try {
      const path = this.createPathJSON();
      await writeFile(path, JSON.stringify(jobs), 'utf-8');
      console.log(`finish create json file in ${path}`);
    } catch (error) {
      console.log(error);
    }
  }

  async scanning() {
    let todayJob = await this.loadJSON<Job>();
    const fetchJobs = await this.linkedinScanner.scanning(
      this.puppeteerDOM,
      this.queryOptions,
      todayJob
    );
    todayJob = [...todayJob, ...fetchJobs];
    console.log('finish fetch jobs');
    await this.writeJSON(todayJob);
  }
}
