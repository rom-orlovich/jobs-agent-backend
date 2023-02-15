import { RequirementsReader } from '../RequirementsReader/RequirementsReader';

import { Scanner } from '../Scanner';
import { LinkedinQueryOptions } from './LinkedinQueryOptions';

import { LinkedinRequirementScanner } from './LinkedinRequirementScanner';
import { Profile } from '../Profile/Profile';
import { JobsDB } from '../../lib/JobsDB';
import { PuppeteerSetup } from '../../lib/PuppeteerSetup';
import { Browser } from 'puppeteer';
import throat from 'throat';
import { UserInput } from '../GeneralQuery/generalQuery';

import { throatPromises } from '../../lib/utils';

import { Job, JobPost } from '../JobsScanner/jobsScanner';

import { exampleQuery, profile } from '../..';

export class LinkedinScanner extends Scanner {
  JobsDB: JobsDB;
  linkedinQuery: LinkedinQueryOptions;
  domain: string;
  constructor(userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super('linkedin', profile);
    this.linkedinQuery = new LinkedinQueryOptions(userInput);
    this.JobsDB = JobsDB;
    this.domain = 'https://www.linkedin.com/jobs';
  }

  setAPIDomain() {
    this.domain = 'http://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings';
  }

  getURL(start: number) {
    const { jobType, experience, location, position, distance, scope, period, sortBy } =
      this.linkedinQuery;
    const url = `${this.domain}/search?keywords=${position}&location=${location}&f_TPR=${period}&distance=${distance}&f_E=${experience}&f_JT=${scope}&sortBy=${sortBy}&f_WT=${jobType}&start=${start}`;
    return url;
  }

  getAllJobsPostData(scannerName: string) {
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
      return { jobID, link, title, company, location, date, from: scannerName };
    });
  }

  async getPageData(pageNum: number, browser: Browser, preJobs: Job[]) {
    const page = await browser.newPage();
    const url = this.getURL(pageNum);
    console.log(url);
    console.log(`page num ${pageNum}`);
    let jobsPosts: Job[] = [];
    // await untilSuccess(async () => {
    //   await page.goto('https://google.com/', { waitUntil: 'load' });
    //   await page.goto(url, { waitUntil: 'load' });
    //   await page.waitForSelector('.base-card', { timeout: 3000 });
    // });
    await Scanner.waitUntilScan(page, url, '.base-card');
    jobsPosts = (await page.evaluate(this.getAllJobsPostData, this.scannerName)).filter(
      this.filterJobsPosts(preJobs)
    );
    await page.close();

    return jobsPosts;
  }

  async getJobsPostPromises(numResults: number, browser: Browser, preJobs: Job[]) {
    let start = 0;
    const promises = [];
    while (start < numResults) {
      const data = this.getPageData(start, browser, preJobs);
      promises.push(data);
      start += 25;
    }

    const jobsPosts = (await Promise.all(throatPromises(4, promises))).flat(1);
    console.log('number', jobsPosts.length);
    return jobsPosts;
  }

  async getTheAPIJobsPosts(browser: Browser, preJobs: Job[]) {
    console.log(this.getURL(0));
    const page = await browser.newPage();
    await page.goto(this.getURL(0));
    const numResults = await page.$eval('.results-context-header__job-count', (el) =>
      Number(el.textContent)
    );

    this.setAPIDomain();
    const jobsPosts = await this.getJobsPostPromises(numResults, browser, preJobs);
    await page.close();
    return jobsPosts;
  }

  async initPuppeteer(preJobs: Job[]) {
    const { browser, page } = await PuppeteerSetup.lunchInstance({
      // headless: false,
      defaultViewport: null,
      args: ['--no-sandbox'],
      slowMo: 200,
    });

    const jobsPosts = await this.getTheAPIJobsPosts(browser, preJobs);

    const promises: Promise<JobPost>[] = jobsPosts.map(
      throat(4, async (jobPost) => {
        console.log(jobPost.link);
        const REPage = await browser.newPage();
        await PuppeteerSetup.noImageRequest(REPage);
        await Scanner.waitUntilScan(REPage, jobPost.link, '.show-more-less-html');
        const jobPostApiHTML = await REPage.evaluate(LinkedinRequirementScanner.getJobPostData);

        await REPage.close();
        // const { reason } = RequirementsReader.checkIsRequirementsMatch(jobPostApiHTML, this.profile);
        const newJob = { text: jobPostApiHTML, ...jobPost };
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

  async scanning(preJobs: Job[]): Promise<JobPost[]> {
    return this.initPuppeteer(preJobs);
  }
  // async scanning(preJobs: Job[]): Promise<any> {
  //   return this.initPuppeteer(preJobs);
  // }
}
// (async () => {
//   const lin = new LinkedinScanner(exampleQuery, profile, new JobsDB());
//   const t = await lin.scanning([]);
// })();
