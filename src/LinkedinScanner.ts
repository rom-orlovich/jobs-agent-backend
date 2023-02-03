import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { CheerioAPI, Element, load } from 'cheerio';
import { RequirementsReader } from '../lib/RequirementsReader';

import { Scanner, TaskProps } from './Scanner';
import { LinkedinQueryOptions } from '../lib/LinkedinQueryOptions';
import { Page } from 'puppeteer';
import { json } from 'express';

export class LinkedinScanner extends Scanner<LinkedinQueryOptions, TaskProps, void> {
  constructor(queryOptions: LinkedinQueryOptions) {
    super(queryOptions);
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

  // async getJobData(id: string, page: Page, html: string, data: TaskProps) {
  //   const $ = load(html);
  //   const posts = $('li');
  //   const postApi = $(posts);
  //   const link = postApi.find('a.base-card__full-link').attr('href');
  //   if (!link) return undefined;

  //   const jobURlSplit = link.split('?')[0].split('-');
  //   const jobID = jobURlSplit[jobURlSplit.length - 1];

  //   const job = await data?.jobs?.getJob(jobID);

  //   if (job) return undefined;

  //   const title = postApi.find('h3.base-search-card__title').text().trim();
  //   if (this.queryOptions.checkWordInBlackList(title)) return undefined;

  //   console.log(link);
  //   await Promise.all([page.goto(link), page.waitForNavigation({ waitUntil: 'load' })]);
  //   const jobPostApiHTML = await page.evaluate(() => document.body.innerHTML);

  //   if (!jobPostApiHTML) return undefined;

  //   const text = $(jobPostApiHTML)?.find('.show-more-less-html ul li').text();
  //   const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(text, data.profile);

  //   await this.delay(4000);
  //   await Promise.all([page.goBack(), page.waitForNavigation({ waitUntil: 'load' })]);
  //   const company = postApi.find('h4.base-search-card__subtitle').text().trim();
  //   const location = postApi.find('span.job-search-card__location').text().trim();
  //   const date = postApi.find('.job-search-card__listdate--new').attr('datetime');

  //   const newJob = { jobID, title, link, company, location, reason, date, from: 'linkedin' };
  //   return newJob;
  // }

  static getJobData() {
    const jobDiv = document.body.querySelector<HTMLDivElement>('.job-search-card');
    const jobMetaData = jobDiv?.dataset['entityUrn'] || '';
    const jobMetaDataSplit = jobMetaData?.split(':');
    const jobID = jobMetaDataSplit[jobMetaDataSplit.length - 1];
    const link = jobDiv?.querySelector<HTMLLinkElement>('a.base-card__full-link')?.href.trim() || '';
    const title = jobDiv?.querySelector('h3.base-search-card__title')?.textContent?.trim();
    const company = jobDiv?.querySelector('h4.base-search-card__subtitle')?.textContent?.trim();
    const location = jobDiv?.querySelector('span.job-search-card__location')?.innerHTML?.trim();
    const date = jobDiv?.querySelector<HTMLTimeElement>('.job-search-card__listdate')?.dateTime;

    return { jobID, link, title, company, location, date };
  }

  // taskCreator() {
  //   const task: TaskFunction<TaskProps, void> = async ({ data, page }) => {
  //     let start = 0;
  //     let continueWhile = true;

  //     while (continueWhile) {
  //       const url = this.getURL(start);
  //       console.log(url);
  //       await page.goto(url, { waitUntil: 'load' });
  //       const html = await page.evaluate(this.getJobData);

  //       // const $ = load(html);
  //       const posts = $('li');
  //       continueWhile = !!posts.length;

  //       for (const post of posts) {
  //         const postApi = $(post);
  //         const link = postApi.find('a.base-card__full-link').attr('href');
  //         if (!link) continue;

  //         const jobURlSplit = link.split('?')[0].split('-');
  //         const jobID = jobURlSplit[jobURlSplit.length - 1];

  //         const job = await data?.jobs?.getJob(jobID);

  //         if (job) continue;

  //         const title = postApi.find('h3.base-search-card__title').text().trim();
  //         if (this.queryOptions.checkWordInBlackList(title)) continue;

  //         console.log(link);
  //         await Promise.all([page.goto(link), page.waitForNavigation({ waitUntil: 'load' })]);
  //         const jobPostApiHTML = await page.evaluate(() => document.body.innerHTML);

  //         if (!jobPostApiHTML) continue;

  //         const text = $(jobPostApiHTML)?.find('.show-more-less-html ul li').text();
  //         const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(text, data.profile);

  //         await this.delay(4000);
  //         await Promise.all([page.goBack(), page.waitForNavigation({ waitUntil: 'load' })]);
  //         const company = postApi.find('h4.base-search-card__subtitle').text().trim();
  //         const location = postApi.find('span.job-search-card__location').text().trim();
  //         const date = postApi.find('.job-search-card__listdate--new').attr('datetime');

  //         const newJob = { jobID, title, link, company, location, reason, date, from: 'linkedin' };

  //         await data.jobs.insertOne(newJob);
  //       }
  //       start += 25;
  //     }

  //     console.log('finish');
  //   };
  //   return task;
  // }
  // taskCreator() {
  //   const task: TaskFunction<TaskProps, void> = async ({ data, page }) => {
  //     let start = 0;
  //     let continueWhile = true;

  //     while (continueWhile) {
  //       const url = this.getURL(start);
  //       console.log(url);
  //       await Promise.all([page.goto(url), page.waitForNavigation({ waitUntil: 'load' })]);
  //       const html = await page.evaluate(() => document.body.innerHTML);

  //       const $ = load(html);
  //       const posts = $('li');
  //       continueWhile = !!posts.length;

  //       for (const post of posts) {
  //         const postApi = $(post);
  //         const link = postApi.find('a.base-card__full-link').attr('href');
  //         if (!link) continue;

  //         const jobURlSplit = link.split('?')[0].split('-');
  //         const jobID = jobURlSplit[jobURlSplit.length - 1];

  //         const job = await data?.jobs?.getJob(jobID);

  //         if (job) continue;

  //         const title = postApi.find('h3.base-search-card__title').text().trim();
  //         if (this.queryOptions.checkWordInBlackList(title)) continue;

  //         console.log(link);
  //         await Promise.all([page.goto(link), page.waitForNavigation({ waitUntil: 'load' })]);
  //         const jobPostApiHTML = await page.evaluate(() => document.body.innerHTML);

  //         if (!jobPostApiHTML) continue;

  //         const text = $(jobPostApiHTML)?.find('.show-more-less-html ul li').text();
  //         const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(text, data.profile);

  //         await this.delay(4000);
  //         await Promise.all([page.goBack(), page.waitForNavigation({ waitUntil: 'load' })]);
  //         const company = postApi.find('h4.base-search-card__subtitle').text().trim();
  //         const location = postApi.find('span.job-search-card__location').text().trim();
  //         const date = postApi.find('.job-search-card__listdate--new').attr('datetime');

  //         const newJob = { jobID, title, link, company, location, reason, date, from: 'linkedin' };

  //         await data.jobs.insertOne(newJob);
  //       }
  //       start += 25;
  //     }

  //     console.log('finish');
  //   };
  //   return task;
  // }
}
