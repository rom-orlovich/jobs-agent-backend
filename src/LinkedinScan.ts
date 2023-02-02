import { Query } from '../lib/Query';
import { Job } from '../lib/types/linkedinScrapper';

import { Log } from './JobsScan';
import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { load } from 'cheerio';
import { RequirementsReader } from '../lib/RequirementsReader';

import { Profile } from '../lib/Profile';
import { ScanningFS } from '../lib/ScanningFS';

export class LinkedinScan {
  queryOptions: Query;
  jobs: Job[];
  logs: Log[];
  constructor(queryOptions: Query) {
    this.jobs = [];
    this.logs = [];
    this.queryOptions = queryOptions;
  }

  getURL(start: number) {
    const { jobQuery, location, period, distance, positionsQuery, sortBy } = this.queryOptions;
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${jobQuery}&location=${location}&f_TPR=${period}&distance=${distance}&f_E=2&f_T=${positionsQuery}&sortBy=${sortBy}&start=${start}`;
    return url;
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  scanning() {
    const task: TaskFunction<{ profile: Profile; jobs: Job[] }, void> = async ({ data, page }) => {
      let promises;
      let start = 0;
      let continueWhile = true;
      const jobs: Job[] = [];
      while (continueWhile) {
        const url = this.getURL(start);
        console.log(url);
        promises = await Promise.all([page.goto(url), page.waitForNavigation({ waitUntil: 'load' })]);
        const html = await page.evaluate(() => document.body.innerHTML);

        const $ = load(html);
        const elements = $('li');
        continueWhile = !!elements.length;

        for (const element of elements) {
          const elementApi = $(element);
          const link = elementApi.find('a.base-card__full-link').attr('href');
          if (!link) continue;
          const jobURlSplit = link.split('?')[0].split('-');
          const title = elementApi.find('h3.base-search-card__title').text().trim();
          if (this.queryOptions.checkWordInBlackList(title)) continue;

          console.log(link);
          promises = await Promise.all([page.goto(link), page.waitForNavigation({ waitUntil: 'load' })]);
          const jobPostHTML = await page.evaluate(() => document.body.innerHTML);

          if (!jobPostHTML) continue;

          const text = $(jobPostHTML)?.find('.show-more-less-html ul li').text();
          const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(text, data.profile);

          const jobID = jobURlSplit[jobURlSplit.length - 1];
          await this.delay(5000);

          promises = await Promise.all([page.goBack(), page.waitForNavigation({ waitUntil: 'load' })]);

          const company = elementApi.find('h4.base-search-card__subtitle').text().trim();
          const location = elementApi.find('span.job-search-card__location').text().trim();
          const date = elementApi.find('.job-search-card__listdate--new').attr('datetime');

          if (data.jobs.find((el) => el.jobID === jobID)) continue;
          jobs.push({ jobID, title, link, company, location, reason, date });
        }
        start += 25;
      }

      console.log('finish');
      await ScanningFS.writeData(jobs);
    };
    return task;
  }

  // async getJobData(puppeteerDOM: PuppeteerCluster, html: string, jobs: Job[], logs: Log[]) {
  //   const cheerioDOM = new CheerioDom(html);
  //   const elements = cheerioDOM.toArray('li');

  //   if (elements.length === 0) return { curJobs: [], curLogs: [], length: elements.length };
  //   const curJobs: Job[] = [];
  //   const curLogs: Log[] = [];
  // for (const element of elements) {
  //   const jobTitle = element.find('h3.base-search-card__title').text().trim();
  //   const link = element.find('a.base-card__full-link').attr('href');
  //   if (link) {
  //     const jobURlSplit = link.split('?')[0].split('-');
  //     const id = jobURlSplit[jobURlSplit.length - 1];
  //     if (!this.queryOptions.checkWordInBlackList(jobTitle))
  //       if (this.queryOptions.checkWordInWhiteList(jobTitle)) {
  //         const isJobExist = jobs.find((el) => el.jobID === id);
  //         const isLogExist = logs.find((el) => el.logID === id);

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
