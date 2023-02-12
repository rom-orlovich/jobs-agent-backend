import axios from 'axios';

import throat from 'throat';
import { GeneralQuery } from './GeneralQuery/GeneralQuery';
import { ScannerName } from './GeneralQuery/generalQuery';

import { JobsDB } from '../lib/JobsDB';
import { Profile } from './Profile/Profile';

import { GoogleTranslate } from './GoogleTranslateScanner/GoogleTranslateScanner';
import { RequirementsReader } from './RequirementsReader/RequirementsReader';
import { Job, JobPost } from './JobsScanner/jobsScanner';

export class Scanner {
  profile: Profile;
  googleTranslate: GoogleTranslate;
  scannerName: ScannerName;
  jobMap = new Map();
  constructor(scannerName: ScannerName, profile: Profile) {
    this.profile = profile;
    this.googleTranslate = new GoogleTranslate({ op: 'translate', from: 'he', to: 'en' });
    this.scannerName = scannerName;
  }

  getURL(...args: any[]): string {
    throw new Error('Method not implemented.');
  }

  protected async getAxiosData<D>(page: number): Promise<D | undefined> {
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
  protected filterJobsPosts<T extends ScannerName, JP extends Job>(
    queryOptions: GeneralQuery<T>,
    preJobs: Job[]
  ) {
    return (curJob: JP) => {
      if (this.jobMap.get(curJob.jobID)) return false;
      else {
        this.jobMap.set(curJob.jobID, true);
      }
      if (!curJob.link || !curJob.jobID || !curJob.title) return false;
      if (queryOptions.checkWordInBlackList(curJob.title)) return false;
      if (preJobs.find((el) => el.jobID === curJob.jobID)) return false;

      return true;
    };
  }
  protected async getResultScanning(promises: Promise<JobPost[]>[], throatNum = 10) {
    const jobsPosts = (await Promise.all(promises.map(throat(throatNum, (el) => el)))).flat(1);
    console.log(`finish found ${jobsPosts.length} jobs in ${this.scannerName}`);
    const jobsTranslate = await this.googleTranslate.translateArrayText(jobsPosts);
    const jobs = RequirementsReader.checkRequirementMatchForArray(jobsTranslate, this.profile);
    return jobs;
  }
}
