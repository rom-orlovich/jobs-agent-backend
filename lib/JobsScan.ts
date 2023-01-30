import { Profile } from './Profile';
import { Query } from './Query';
import { Job } from './types/linkedinScrapper';
import { writeFile } from 'fs/promises';
import path from 'path';
import { LinkedinScan } from './LinkedinScan';
export class JobsScan {
  queryOptions: Query;
  profile: Profile;
  jobs: Job[];
  constructor(profile: Profile, queryOptions: Query) {
    this.jobs = [];
    this.queryOptions = queryOptions;
    this.profile = profile;
  }

  async writeJSON() {
    const date = new Date().toLocaleDateString().split('/').join('-');
    const fileName = `${date}.json`;
    await writeFile(path.join(__dirname, fileName), JSON.stringify(this.jobs), 'utf-8');

    console.log(`finish create ${fileName}`);
  }

  async scanning() {
    const linkedinScanner = new LinkedinScan(this.queryOptions);
    const jobs = await linkedinScanner.scanning(this.profile, this.queryOptions);
    this.jobs = [...this.jobs, ...jobs];
    await this.writeJSON();
  }
}
