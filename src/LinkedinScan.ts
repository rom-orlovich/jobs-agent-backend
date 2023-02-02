import axios from 'axios';
import { CheerioDom } from '../lib/CheerioDom';

import { Query } from '../lib/Query';
import { Job } from '../lib/types/linkedinScrapper';
import { createHash } from 'crypto';

import { PuppeteerCluster } from '../lib/PuppeteerDOM';
import { Log } from './JobsScan';
import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { load } from 'cheerio';
import { RequirementsReader } from '../lib/RequirementsReader';
import { profile } from '.';
import { Profile } from '../lib/Profile';

export class LinkedinScan {
  queryOptions: Query;
  jobs: Job[];
  logs: Log[];
  constructor(queryOptions: Query) {
    this.jobs = [];
    this.logs = [];
    this.queryOptions = queryOptions;
  }

  getURL() {
    const { jobQuery, location, period, distance, positionsQuery, sortBy } = this.queryOptions;
    const url = `https://il.linkedin.com/jobs/search?keywords=${jobQuery}&location=${location}&f_TPR=${period}&distance=${distance}&f_E=2&f_T=${positionsQuery}&sortBy=${sortBy}`;
    return url;
  }

  async getHTML(start: number) {
    const { jobQuery, location, period, distance, positionsQuery, sortBy } = this.queryOptions;
    try {
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${jobQuery}&location=${location}&f_TPR=${period}&distance=${distance}&f_E=2&f_T=${positionsQuery}&sortBy=${sortBy}&start=${start}`;
      console.log(url);
      const res = await axios(url);
      return res.data;
    } catch (error) {
      return '';
    }
  }
  scanTask() {
    const task: TaskFunction<{ profile: Profile; jobs: Job[] }, Job[]> = async ({
      data,
      page,
      worker,
    }) => {
      const url = this.getURL();
      await page.goto(url);

      const html = await page.evaluate(async () => {
        let btn = document.querySelector('.infinite-scroller__show-more-button');
        if (btn) btn.classList.add('infinite-scroller__show-more-button--visible');
        while (btn) {
          await page.click('infinite-scroller__show-more-button--visible');
          btn = document.querySelector('.infinite-scroller__show-more-button--visible');
        }
        return document.body.innerHTML;
      });
      const jobs: Job[] = [];

      const $ = load(html);
      const jobsPosts = $('.job-search-card');

      for (const el of jobsPosts) {
        const curEl = $(el);
        const title: string = $(el).find('.sr-only').text();
        if (this.queryOptions.checkWordInBlackList(title)) continue;
        await page.click(`a[href*='${curEl.attr('href')}']`);
        const element = await page.waitForSelector('.top-card-layout__title');
        const jobDetailsHtml = await page.evaluate((element) => {
          return element?.innerHTML;
        }, element);
        if (!jobDetailsHtml) continue;
        const jobDetails = $(jobDetailsHtml);
        const text = jobDetails.find('.show-more-less-html__markup ul li').text();
        const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(text, data.profile);
        const jobID = (curEl.data('entity-urn') as string).split(':').at(-1) || '';
        const location = curEl.find('.job-search-card__location').text();
        const link = curEl.find('a.base-card__full-link').attr('href') || '';
        const company = curEl.find('.base-search-card__subtitle').text();
        const date = curEl.find('.job-search-card__listdate').attr('datetime');
        if (data.jobs.find((el) => el.jobID === jobID))
          jobs.push({ jobID, title, link, date, company, location, reason });
      }
      return jobs;
      // infinite-scroller__show-more-button infinite-scroller__show-more-button--visible
    };

    return task;
  }

  // async getJobData(puppeteerDOM: PuppeteerCluster, html: string, jobs: Job[], logs: Log[]) {
  //   const cheerioDOM = new CheerioDom(html);
  //   const elements = cheerioDOM.toArray('li');

  //   if (elements.length === 0) return { curJobs: [], curLogs: [], length: elements.length };
  //   const curJobs: Job[] = [];
  //   const curLogs: Log[] = [];
  //   for (const element of elements) {
  //     const jobTitle = element.find('h3.base-search-card__title').text().trim();
  //     const link = element.find('a.base-card__full-link').attr('href');
  //     if (link) {
  //       const jobURlSplit = link.split('?')[0].split('-');
  //       const id = jobURlSplit[jobURlSplit.length - 1];
  //       if (!this.queryOptions.checkWordInBlackList(jobTitle))
  //         if (this.queryOptions.checkWordInWhiteList(jobTitle)) {
  //           const isJobExist = jobs.find((el) => el.jobID === id);
  //           const isLogExist = logs.find((el) => el.logID === id);

  //           if (!isJobExist && !isLogExist) {
  //             const isRequirementValid = await puppeteerDOM.init(link, '.show-more-less-html ul *');

  //             if (isRequirementValid.pass) {
  //               const company = element.find('h4.base-search-card__subtitle').text().trim();
  //               const location = element.find('span.job-search-card__location').text().trim();

  //               curJobs.push({
  //                 jobID: id,
  //                 jobTitle,
  //                 company,
  //                 location,
  //                 link: link || '',
  //               });
  //             } else {
  //               curLogs.push({
  //                 link: link,
  //                 logID: id,
  //                 reason: isRequirementValid.reason,
  //                 title: jobTitle,
  //               });
  //             }
  //           }
  //         }
  //     }
  //   }

  //   return { curJobs, curLogs, length: elements.length };
  // }

  // async scanning(puppeteerDOM: PuppeteerCluster, queryOptions: Query, jobs: Job[], logs: Log[]) {
  //   let start = 0;
  //   while (start < queryOptions.limit) {
  //     const html = await this.getHTML(start);
  //     const { curLogs, curJobs, length } = await this.getJobData(puppeteerDOM, html, jobs, logs);
  //     console.log('jobs were found', length);
  //     if (length === 0) return { curJobs: this.jobs, curLogs: this.logs };
  //     this.jobs = [...this.jobs, ...curJobs];
  //     this.logs = [...this.logs, ...curLogs];
  //     start += 25;
  //   }

  //   return { curJobs: this.jobs, curLogs: this.logs };
  // }
}
