import { RequirementsReader } from '../lib/RequirementsReader';

import { Scanner } from './Scanner';
import { LinkedinQueryOptions } from '../lib/LinkedinQueryOptions';

import { Job } from '../lib/types/linkedinScanner';
import { LinkedinRequirementScanner } from './LinkedinRequirementScanner';
import { Profile } from '../lib/Profile';
import { JobsDB } from '../lib/JobsDB';
import { PuppeteerSetup } from '../lib/PuppeteerSetup';
import { Page } from 'puppeteer';
import throat from 'throat';
import { UserInput } from '../lib/GeneralQuery';
import { exampleQuery, profile } from '..';
import { untilSuccess } from '../lib/utils';
import { JobPost } from './AllJobScanner';

export class LinkedinScanner extends Scanner {
  JobsDB: JobsDB;
  linkedinQuery: LinkedinQueryOptions;
  constructor(userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super('linkedin', userInput, profile);
    this.linkedinQuery = new LinkedinQueryOptions(userInput);
    this.JobsDB = JobsDB;
  }

  getURL(start: number) {
    const { jobType, exp, location, position, distance, scope, period, sortBy } = this.linkedinQuery;
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${position}&location=${location}&f_TPR=${period}&distance=${distance}&f_E=${exp}&f_JT=${scope}&sortBy=${sortBy}&f_WT=${jobType}&start=${start}`;
    return url;
  }

  getAllJobsPostData() {
    const jobDIVList = Array.from(document.body.querySelectorAll<HTMLDivElement>('.job-search-card'));
    if (jobDIVList.length === 0) return [];
    return jobDIVList.map((jobDIV) => {
      const jobMetaData = jobDIV?.dataset['entityUrn'] || '';
      const jobMetaDataSplit = jobMetaData?.split(':');
      const jobID = jobMetaDataSplit[jobMetaDataSplit.length - 1];
      const link = jobDIV?.querySelector<HTMLLinkElement>('a.base-card__full-link')?.href.trim() || '';
      const title = jobDIV?.querySelector('h3.base-search-card__title')?.textContent?.trim() || '';
      const company = jobDIV?.querySelector('h4.base-search-card__subtitle')?.textContent?.trim() || '';
      const location = jobDIV?.querySelector('span.job-search-card__location')?.innerHTML?.trim() || '';
      const date = jobDIV?.querySelector<HTMLTimeElement>('.job-search-card__listdate')?.dateTime;
      return { jobID, link, title, company, location, date, from: this.scannerName };
    });
  }

  async getPageData(pageNum: number, page: Page, preJobs: Job[]) {
    const url = this.getURL(pageNum);
    console.log(url);
    console.log(`page num ${pageNum}`);
    let jobsPosts: Job[] = [];
    await untilSuccess(async () => {
      await page.goto(url, { waitUntil: 'load' });

      jobsPosts = (await page.evaluate(this.getAllJobsPostData)).filter((jobPost) => {
        if (!jobPost.link || !jobPost.jobID || !jobPost.title) return false;
        if (this.linkedinQuery.checkWordInBlackList(jobPost.title)) return false;
        if (preJobs.find((el) => el.jobID === jobPost.jobID)) return false;
        return true;
      });
    });

    return jobsPosts;
  }

  async initPuppeteer(preJobs: Job[]) {
    const { browser, page } = await PuppeteerSetup.lunchInstance({
      // headless: false,
      defaultViewport: null,
      args: ['--no-sandbox'],
      slowMo: 100,
    });
    const jobsPosts: Job[] = [];
    let start = 0;
    let continueWhile = true;

    while (continueWhile) {
      const data = await this.getPageData(start, page, preJobs);

      jobsPosts.push(...data);
      continueWhile = !!data.length;

      start += 25;
    }
    console.log('number', jobsPosts.length);

    const promises: Promise<Job>[] = jobsPosts.map(
      throat(5, async (jobPost) => {
        console.log(jobPost.link);
        const REPage = await browser.newPage();
        await PuppeteerSetup.noImageRequest(REPage);
        await LinkedinRequirementScanner.goToRequirement(REPage, jobPost.link);
        const jobPostApiHTML = await REPage.evaluate(LinkedinRequirementScanner.getJobPostData);

        await REPage.close();
        const { reason } = RequirementsReader.checkIsRequirementsMatch(jobPostApiHTML, this.profile);
        const newJob = { reason, ...jobPost };
        console.log(newJob);
        return newJob;
      })
    );

    try {
      const jobs = await Promise.all(promises);
      console.log(`finish found ${jobs.length} jobs in linkedin`);
      await browser.close();

      return jobs;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async scanning(preJobs: Job[]): Promise<Job[]> {
    return this.initPuppeteer(preJobs);
  }
}
(async () => {
  const lin = new LinkedinScanner(exampleQuery, profile, new JobsDB());
  const t = await lin.scanning([]);
})();
