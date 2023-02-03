import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';

import { RequirementsReader } from '../lib/RequirementsReader';

import { Scanner, TaskProps } from './Scanner';
import { LinkedinQueryOptions } from '../lib/LinkedinQueryOptions';
import puppeteer from 'puppeteer';

import { Job } from '../lib/types/linkedinScanner';
import { LinkedinRequirementScanner } from './LinkedinRequirementScanner';
import { Profile } from '../lib/Profile';
import { JobsDB } from '../lib/JobsDB';

export class LinkedinScanner extends Scanner<LinkedinQueryOptions, TaskProps, Job[]> {
  JobsDB: JobsDB;
  constructor(queryOptions: LinkedinQueryOptions, JobsDB: JobsDB) {
    super(queryOptions);
    this.JobsDB = JobsDB;
  }

  getURL(start: number) {
    const { jobQuery, location, period, distance, positionsQuery, sortBy } = this.queryOptions;
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${jobQuery}&location=${location}&f_TPR=${period}&distance=${distance}&f_E=2&f_T=${positionsQuery}&sortBy=${sortBy}&start=${start}`;
    return url;
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getJobPostID(link: string) {
    const jobURlSplit = link.split('?')[0].split('-');
    const jobID = jobURlSplit[jobURlSplit.length - 1];
    return jobID;
  }

  static getAllJobsData() {
    const jobDIVList = Array.from(document.body.querySelectorAll<HTMLDivElement>('.job-search-card'));
    return jobDIVList.map((jobDIV) => {
      const jobMetaData = jobDIV?.dataset['entityUrn'] || '';
      const jobMetaDataSplit = jobMetaData?.split(':');
      const jobID = jobMetaDataSplit[jobMetaDataSplit.length - 1];
      const link = jobDIV?.querySelector<HTMLLinkElement>('a.base-card__full-link')?.href.trim() || '';
      const title = jobDIV?.querySelector('h3.base-search-card__title')?.textContent?.trim() || '';
      const company = jobDIV?.querySelector('h4.base-search-card__subtitle')?.textContent?.trim() || '';
      const location = jobDIV?.querySelector('span.job-search-card__location')?.innerHTML?.trim() || '';
      const date = jobDIV?.querySelector<HTMLTimeElement>('.job-search-card__listdate')?.dateTime;

      return { jobID, link, title, company, location, date, from: 'linkedin' };
    });
  }

  taskCreator() {
    const task: TaskFunction<TaskProps, Job[]> = async ({ data, page }) => {
      let start = 0;
      let continueWhile = true;
      const jobs: Job[] = [];
      await this.noImageRequest(page);

      while (continueWhile) {
        console.log(`page num ${start}`);
        const url = this.getURL(start);
        console.log(url);
        await page.goto(url, { waitUntil: 'load' });

        const jobsPosts = await page.evaluate(LinkedinScanner.getAllJobsData);
        continueWhile = !!jobsPosts.length;
        for (const jobPost of jobsPosts) {
          console.log(jobPost.link);

          if (!jobPost.link || !jobPost.jobID || !jobPost.title) continue;
          const job = await data?.JobsDB?.getJob(jobPost.jobID);
          if (job) continue;

          // const jobPostApiHTML = await data.cluster?.execute(
          //   { ...data, URL: jobPost.link },
          //   LinkedinRequirementScanner.taskCreator()
          // );

          console.log(jobPost);
          // const { reason } = RequirementsReader.checkIsRequirementsMatch(jobPostApiHTML, data.profile);

          jobs.push({ ...jobPost });
        }

        // await data.jobs.insertMany(jobs);
        // const $ = load(html);

        // continueWhile = !!posts.length;

        // for (const post of posts) {
        //   const postApi = $(post);
        //   const link = postApi.find('a.base-card__full-link').attr('href');
        //   if (!link) continue;

        //   const jobURlSplit = link.split('?')[0].split('-');
        //   const jobID = jobURlSplit[jobURlSplit.length - 1];

        //   const job = await data?.jobs?.getJob(jobID);

        //   if (job) continue;

        //   const title = postApi.find('h3.base-search-card__title').text().trim();
        //   if (this.queryOptions.checkWordInBlackList(title)) continue;

        //   console.log(link);
        //   await Promise.all([page.goto(link), page.waitForNavigation({ waitUntil: 'load' })]);
        //   const jobPostApiHTML = await page.evaluate(() => document.body.innerHTML);

        //   if (!jobPostApiHTML) continue;

        //   const text = $(jobPostApiHTML)?.find('.show-more-less-html ul li').text();
        //   const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(text, data.profile);

        //   await this.delay(4000);
        //   await Promise.all([page.goBack(), page.waitForNavigation({ waitUntil: 'load' })]);
        //   const company = postApi.find('h4.base-search-card__subtitle').text().trim();
        //   const location = postApi.find('span.job-search-card__location').text().trim();
        //   const date = postApi.find('.job-search-card__listdate--new').attr('datetime');

        //   const newJob = { jobID, title, link, company, location, reason, date, from: 'linkedin' };

        //
        // }
        start += 25;
      }

      console.log('finish');
      return jobs;
    };
    return task;
  }

  async initPuppeteer(profile: Profile) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, slowMo: 250 });
    const page = await browser.newPage();

    let start = 0;
    let continueWhile = true;

    await this.noImageRequest(page);

    while (continueWhile) {
      console.log(`page num ${start}`);
      const url = this.getURL(start);
      console.log(url);
      await page.goto(url, { waitUntil: 'load' });

      const jobsPosts = await page.evaluate(LinkedinScanner.getAllJobsData);
      continueWhile = !!jobsPosts.length;
      for (const jobPost of jobsPosts) {
        console.log(jobPost.link);

        if (!jobPost.link || !jobPost.jobID || !jobPost.title) continue;
        if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;
        const job = await this.JobsDB?.getJob(jobPost.jobID);
        if (job) continue;
        const linkedinRequirementScanner = new LinkedinRequirementScanner(null);
        const REPage = await browser.newPage();
        await linkedinRequirementScanner.goToRequirement(REPage, jobPost.link);

        const jobPostApiHTML = await page.evaluate(LinkedinRequirementScanner.getJobPostData);
        await REPage.close();
        const { reason } = RequirementsReader.checkIsRequirementsMatch(jobPostApiHTML, profile);

        const newJob = { reason, ...jobPost };
        console.log(newJob);
        // jobs.push(newJob);
        this.JobsDB.insertOne(newJob);
      }

      start += 25;
    }

    await browser.close();

    console.log('finish');
  }
}
