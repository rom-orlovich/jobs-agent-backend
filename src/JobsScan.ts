import { Profile } from '../lib/Profile';
import { Query } from '../lib/Query';
import { Job } from '../lib/types/linkedinScrapper';
import { writeFile } from 'fs/promises';
import path from 'path';
import { LinkedinScan } from './LinkedinScan';
import { PuppeteerDOM } from '../lib/PuppeteerDOM';
export class JobsScan {
  queryOptions: Query;
  profile: Profile;
  jobs: Job[];
  puppeteerDOM: PuppeteerDOM;
  linkedinScanner: LinkedinScan;

  constructor(profile: Profile, queryOptions: Query) {
    this.jobs = [];
    this.queryOptions = queryOptions;
    this.profile = profile;
    this.puppeteerDOM = new PuppeteerDOM(profile);
    this.linkedinScanner = new LinkedinScan(this.queryOptions);
  }

  async writeJSON() {
    const date = new Date().toLocaleDateString().split('/').join('-');
    const fileName = `${date}.json`;
    await writeFile(path.join(__dirname, fileName), JSON.stringify(this.jobs), 'utf-8');

    console.log(`finish create ${fileName}`);
  }

  async scanning() {
    const jobs = await this.linkedinScanner.scanning(this.puppeteerDOM, this.queryOptions);

    this.jobs = [...this.jobs, ...jobs];
    // await this.writeJSON();
  }
}
