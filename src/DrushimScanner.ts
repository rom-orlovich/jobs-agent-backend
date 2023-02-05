import throat from 'throat';

import { jobs, profile, queryOptions } from '..';
import { PuppeteerSetup } from '../lib/PuppeteerSetup';
import { DrushimQueryOptions } from '../lib/DrushimQueryOptions';
import { Profile } from '../lib/Profile';
import { DrushimAPI, DrushimResult } from '../lib/types/drushim';
import { Job } from '../lib/types/linkedinScanner';
import { JobPost } from './AllJobScanner';
import { GoogleTranslateScanner } from './GoogleTranslateScanner';
import { Scanner } from './Scanner';

export class DrushimScanner extends Scanner<DrushimQueryOptions, null, Job[]> {
  constructor(queryOptions: DrushimQueryOptions, profile: Profile) {
    super(queryOptions, profile);
  }
  getURL(page?: number | undefined): string {
    return `https://www.drushim.co.il/api/jobs/search?area=1&searchterm=Fullstack%20Developer&geolexid=537905&range=3&ssaen=1&isAA=true&page=${0}&isAA=true`;
  }

  // getLastResult(data: DrushimAPI | undefined) {
  //   if (!data) return undefined;
  //   const resultList = data?.ResultList;
  //   const lastResult = data?.ResultList[resultList.length - 1];
  //   return lastResult;
  // }
  getJobsData(results: DrushimResult[] | undefined): JobPost[] {
    if (!results) return [];
    return results
      .map((result) => ({
        company: result.Company.CompanyDisplayName,
        jobID: String(result.Code),
        link: 'https://www.drushim.co.il' + result.JobInfo.Link,
        location: result.JobContent.Addresses[0].CityEnglish,
        title: result.JobContent.FullName,
        date: result.JobInfo.Date,
        from: 'drushim',
        text: result.JobContent.Requirements,
      }))
      .filter((jobData) => !this.queryOptions.checkWordInBlackList(jobData.title));
  }

  // getReason(text: string) {
  //   return RequirementsReader.checkIsRequirementsMatch(text, this.profile).reason;
  // }

  // async normalizeJobs(jobsPosts: JobPost[]) {
  //   const googleTranslateScanner = new GoogleTranslateScanner({ to: 'en', from: 'he', op: 'translate' });

  //   const { browser } = await PuppeteerSetup.lunchInstance({ headless: false });
  //   const promises = jobsPosts.map(
  //     throat(5, async ({ text, ...job }) => {
  //       const newPage = await browser.newPage();
  //       const translateText = await googleTranslateScanner.goTranslate(newPage, text);
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

  async scanning(preJobs: Job[]): Promise<Job[]> {
    const jobsPosts: JobPost[] = [];

    let page = 1;
    let data = await this.getAxiosData<DrushimAPI>(0);

    if (!data) return [];

    while (page < (data?.TotalPagesNumber || 0)) {
      console.log(`Page number ${page}`);

      jobsPosts.push(...this.getJobsData(data?.ResultList));
      page++;
      data = await this.getAxiosData<DrushimAPI>(page);
    }

    // console.log(jobsPosts);
    console.log(`finish found ${jobsPosts.length} jobs in allJobs`);
    const jobs = await this.translateText(jobsPosts);

    return jobs;
  }
}

// (async () => {
//   const drushim = new DrushimScanner(new DrushimQueryOptions(queryOptions), profile);
//   await drushim.scanning([]);
// })();
