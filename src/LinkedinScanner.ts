import { RequirementsReader } from '../lib/RequirementsReader';

import { Scanner, TaskProps } from './Scanner';
import { LinkedinQueryOptions } from '../lib/LinkedinQueryOptions';

import { Job } from '../lib/types/linkedinScanner';
import { LinkedinRequirementScanner } from './LinkedinRequirementScanner';
import { Profile } from '../lib/Profile';
import { JobsDB } from '../lib/JobsDB';
import { PuppeteerSetup } from '../lib/PuppeteerSetup';
import { Page } from 'puppeteer';
import throat from 'throat';
import { ScannerName, UserInput } from '../lib/GeneralQuery';

export class LinkedinScanner extends Scanner {
  JobsDB: JobsDB;
  linkedinQuery: LinkedinQueryOptions;
  constructor(userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super('linkedin', userInput, profile);
    this.linkedinQuery = new LinkedinQueryOptions(userInput);
    this.JobsDB = JobsDB;
  }

  getURL(start: number) {
    // const { jobQuery, location, period, distance, positionsQuery, sortBy } = this.queryOptions;
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

    await page.goto(url, { waitUntil: 'load' });

    const jobsPosts = (await page.evaluate(this.getAllJobsPostData)).filter((jobPost) => {
      if (!jobPost.link || !jobPost.jobID || !jobPost.title) return false;
      if (this.linkedinQuery.checkWordInBlackList(jobPost.title)) return false;
      if (preJobs.find((el) => el.jobID === jobPost.jobID)) return false;
      return true;
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
// (async () => {
//   const lin = new LinkedinScanner('linkedin', queryOptions, profile, new JobsDB());
//   const t = await lin.scanning([]);
// })();
// taskCreator() {
//   const task: TaskFunction<TaskProps, Job[]> = async ({ data, page }) => {
//     let start = 0;
//     let continueWhile = true;
//     const jobs: Job[] = [];
//     await this.noImageRequest(page);

//     while (continueWhile) {
//       console.log(`page num ${start}`);
//       const url = this.getURL(start);
//       console.log(url);
//       await page.goto(url, { waitUntil: 'load' });

//       const jobsPosts = await page.evaluate(LinkedinScanner.getAllJobsData);
//       continueWhile = !!jobsPosts.length;
//       for (const jobPost of jobsPosts) {
//         console.log(jobPost.link);

//         if (!jobPost.link || !jobPost.jobID || !jobPost.title) continue;
//         const job = await data?.JobsDB?.getJob(jobPost.jobID);
//         if (job) continue;

//         // const jobPostApiHTML = await data.cluster?.execute(
//         //   { ...data, URL: jobPost.link },
//         //   LinkedinRequirementScanner.taskCreator()
//         // );

//         console.log(jobPost);
//         // const { reason } = RequirementsReader.checkIsRequirementsMatch(jobPostApiHTML, data.profile);

//         jobs.push({ ...jobPost });
//       }

//       // await data.jobs.insertMany(jobs);
//       // const $ = load(html);

//       // continueWhile = !!posts.length;

//       // for (const post of posts) {
//       //   const postApi = $(post);
//       //   const link = postApi.find('a.base-card__full-link').attr('href');
//       //   if (!link) continue;

//       //   const jobURlSplit = link.split('?')[0].split('-');
//       //   const jobID = jobURlSplit[jobURlSplit.length - 1];

//       //   const job = await data?.jobs?.getJob(jobID);

//       //   if (job) continue;

//       //   const title = postApi.find('h3.base-search-card__title').text().trim();
//       //   if (this.queryOptions.checkWordInBlackList(title)) continue;

//       //   console.log(link);
//       //   await Promise.all([page.goto(link), page.waitForNavigation({ waitUntil: 'load' })]);
//       //   const jobPostApiHTML = await page.evaluate(() => document.body.innerHTML);

//       //   if (!jobPostApiHTML) continue;

//       //   const text = $(jobPostApiHTML)?.find('.show-more-less-html ul li').text();
//       //   const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(text, data.profile);

//       //   await this.delay(4000);
//       //   await Promise.all([page.goBack(), page.waitForNavigation({ waitUntil: 'load' })]);
//       //   const company = postApi.find('h4.base-search-card__subtitle').text().trim();
//       //   const location = postApi.find('span.job-search-card__location').text().trim();
//       //   const date = postApi.find('.job-search-card__listdate--new').attr('datetime');

//       //   const newJob = { jobID, title, link, company, location, reason, date, from: this.scannerName'linkedin' };

//       //
//       // }
//       start += 25;
//     }

//     console.log('finish');
//     return jobs;
//   };
//   return task;
// }
