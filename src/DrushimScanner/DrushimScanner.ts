import { exampleQuery, profile } from '../..';
import { DrushimQueryOptions } from './DrushimQueryOptions';
import { UserInput } from '../GeneralQuery';
import { JobsDB } from '../../lib/JobsDB';
import { Profile } from '../Profile/Profile';
import { DrushimAPI, DrushimResult } from './drushimScanner';
import { Scanner } from '../Scanner';
import { Job, JobPost } from '../JobsScanner/jobsScanner';

export class DrushimScanner extends Scanner {
  drushimQueryOptions: DrushimQueryOptions;
  constructor(userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super('drushim', profile);
    this.drushimQueryOptions = new DrushimQueryOptions(userInput);
  }
  getURL(page: number): string {
    const { exp, scope, location, distance, position } = this.drushimQueryOptions;

    return `https://www.drushim.co.il/api/jobs/search?experience=${exp}&scope=${scope}&area=1&searchterm=${position}&geolexid=${location}&range=${distance}&ssaen=1&page=${page}&isAA=true`;
  }

  getJobsData(results: DrushimResult[] | undefined): JobPost[] {
    if (!results) return [];
    return results.map((result) => ({
      jobID: String(result.Code),
      company: result.Company.CompanyDisplayName,
      link: 'https://www.drushim.co.il' + result.JobInfo.Link,
      location: result.JobContent.Addresses.map((el) => el.CityEnglish).join(','),
      title: result.JobContent.FullName,
      date: result.JobInfo.Date,
      from: this.scannerName,
      text: result.JobContent.Requirements,
    }));
  }

  async getNormalizeData(page: number, preJobs: Job[]) {
    const data = await this.getAxiosData<DrushimAPI>(page);
    return this.getJobsData(data?.ResultList).filter((jobPost) =>
      // {
      //   if (!jobPost.link || !jobPost.jobID || !jobPost.title || !jobPost.text) return false;
      //   if (this.drushimQueryOptions.checkWordInBlackList(jobPost.title)) return false;
      //   if (preJobs.find((el) => el.jobID === jobPost.jobID)) return false;
      //   return true;
      // }
      this.filterJobsPosts(this.drushimQueryOptions, preJobs)
    );
  }

  async scanning(preJobs: Job[]): Promise<Job[]> {
    const data = await this.getAxiosData<DrushimAPI>(0);

    if (!data) return [];
    let page = 1;
    const promises: Promise<JobPost[]>[] = [Promise.resolve(this.getJobsData(data?.ResultList))];
    while (page < (data?.TotalPagesNumber || 0)) {
      console.log(`Page number ${page}`);
      promises.push(this.getNormalizeData(page, preJobs));
      page++;
    }

    return await this.getResultScanning(promises);
  }
}

// (async () => {
//   const drushim = new DrushimScanner(exampleQuery, profile, new JobsDB());
//   const t = await drushim.scanning([]);

//   console.log('Finish scanning drushim');
//   console.log(t);
// })();
