import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { load } from 'cheerio';
import { RequirementsReader } from '../lib/RequirementsReader';

import { Scanner, TaskProps } from './Scanner';
import { LinkedinQueryOptions } from '../lib/LinkedinQueryOptions';

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

  taskCreator() {
    const task: TaskFunction<TaskProps, void> = async ({ data, page }) => {
      let promises;
      let start = 0;
      let continueWhile = true;
      // const jobs: Job[] = [];

      while (continueWhile) {
        const url = this.getURL(start);
        console.log(url);
        promises = await Promise.all([page.goto(url), page.waitForNavigation({ waitUntil: 'load' })]);
        const html = await page.evaluate(() => document.body.innerHTML);

        const $ = load(html);
        const posts = $('li');
        continueWhile = !!posts.length;

        for (const post of posts) {
          const postApi = $(post);
          const link = postApi.find('a.base-card__full-link').attr('href');
          if (!link) continue;

          const jobURlSplit = link.split('?')[0].split('-');
          const jobID = jobURlSplit[jobURlSplit.length - 1];

          const job = await data?.jobs?.getJob(jobID);

          if (job) continue;

          const title = postApi.find('h3.base-search-card__title').text().trim();
          if (this.queryOptions.checkWordInBlackList(title)) continue;

          console.log(link);
          promises = await Promise.all([page.goto(link), page.waitForNavigation({ waitUntil: 'load' })]);
          const jobpostApiHTML = await page.evaluate(() => document.body.innerHTML);

          if (!jobpostApiHTML) continue;

          const text = $(jobpostApiHTML)?.find('.show-more-less-html ul li').text();
          const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(text, data.profile);

          await this.delay(4000);

          promises = await Promise.all([page.goBack(), page.waitForNavigation({ waitUntil: 'load' })]);

          const company = postApi.find('h4.base-search-card__subtitle').text().trim();
          const location = postApi.find('span.job-search-card__location').text().trim();
          const date = postApi.find('.job-search-card__listdate--new').attr('datetime');
          const newJob = { jobID, title, link, company, location, reason, date };
          // jobs.push({ jobID, title, link, company, location, reason, date });
          await data.jobs.insertOne(newJob);
        }
        start += 25;
      }

      console.log('finish');
      // return [...data.jobs, ...jobs];
      // console.log('finish');
      // await ScanningFS.writeData([...data.jobs, ...jobs]);
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
