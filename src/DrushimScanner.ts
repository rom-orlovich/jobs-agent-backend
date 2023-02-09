import { DrushimQueryOptions } from '../lib/DrushimQueryOptions';
import { UserInput } from '../lib/GeneralQuery';
import { JobsDB } from '../lib/JobsDB';
import { Profile } from '../lib/Profile';
import { DrushimAPI, DrushimResult } from '../lib/types/drushim';
import { Job } from '../lib/types/linkedinScanner';
import { JobPost } from './AllJobScanner';

import { Scanner } from './Scanner';

export class DrushimScanner extends Scanner {
  drushimQueryOptions: DrushimQueryOptions;
  constructor(userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super('drushim', userInput, profile);
    this.drushimQueryOptions = new DrushimQueryOptions(userInput);
  }
  getURL(page: number): string {
    //     experience
    // scope
    // scope
    // range
    const { exp, scope, location, distance, jobType, position } = this.drushimQueryOptions;
    return `https://www.drushim.co.il/api/jobs/search?experience=${exp}&scope=${scope}-${jobType}&area=1&searchterm=${position}&geolexid=${location}&range=${distance}&ssaen=1&page=${page}&isAA=true`;
  }

  getJobsData(results: DrushimResult[] | undefined): JobPost[] {
    if (!results) return [];
    return results.map((result) => ({
      jobID: String(result.Code),
      company: result.Company.CompanyDisplayName,
      link: 'https://www.drushim.co.il' + result.JobInfo.Link,
      location: result.JobContent.Addresses[0].CityEnglish,
      title: result.JobContent.FullName,
      date: result.JobInfo.Date,
      from: this.scannerName,
      text: result.JobContent.Requirements,
    }));
  }

  async getNormalizeData(page: number, preJobs: Job[]) {
    const data = await this.getAxiosData<DrushimAPI>(page);
    return this.getJobsData(data?.ResultList).filter((jobPost) => {
      if (!jobPost.link || !jobPost.jobID || !jobPost.title || !jobPost.text) return false;
      if (this.drushimQueryOptions.checkWordInBlackList(jobPost.title)) return false;
      if (preJobs.find((el) => el.jobID === jobPost.jobID)) return false;
      return true;
    });
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
//   const drushim = new DrushimScanner('drushim', new DrushimQueryOptions(queryOptions), profile);
//   const t = await drushim.scanning([]);
// })();

// getReason(text: string) {
//   return RequirementsReader.checkIsRequirementsMatch(text, this.profile).reason;
// }

// async normalizeJobs(jobsPosts: JobPost[]) {
//   const GoogleTranslate = new GoogleTranslate({ to: 'en', from: this.scannerName'he', op: 'translate' });

//   const { browser } = await PuppeteerSetup.lunchInstance({ headless: false });
//   const promises = jobsPosts.map(
//     throat(5, async ({ text, ...job }) => {
//       const newPage = await browser.newPage();
//       const translateText = await GoogleTranslate.goTranslate(newPage, text);
//       await newPage.close();

//       return {
//         ...job,
//         reason: this.getReason(translateText),
//       };
//     })
//   );

//   const jobs = await Promise.all(promises);
//   await browser.close();
//   return jobs;
// }
