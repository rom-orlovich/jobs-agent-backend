import axios from 'axios';
import { CheerioDom } from '../lib/CheerioDom';

import { Query } from '../lib/Query';
import { Job } from '../lib/types/linkedinScrapper';
import { createHash } from 'crypto';

import { PuppeteerDOM } from '../lib/PuppeteerDOM';
import { Log } from './JobsScan';

export class LinkedinScan {
  queryOptions: Query;
  jobs: Job[];
  logs: Log[];
  constructor(queryOptions: Query) {
    this.jobs = [];
    this.logs = [];
    this.queryOptions = queryOptions;
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

  async getJobData(puppeteerDOM: PuppeteerDOM, html: string, jobs: Job[], logs: Log[]) {
    const cheerioDOM = new CheerioDom(html);
    const elements = cheerioDOM.toArray('li');

    if (elements.length === 0) return { curJobs: [], curLogs: [], length: elements.length };
    const curJobs: Job[] = [];
    const curLogs: Log[] = [];
    for (const element of elements) {
      const jobTitle = element.find('h3.base-search-card__title').text().trim();
      const link = element.find('a.base-card__full-link').attr('href');
      if (link) {
        const jobURlSplit = link.split('?')[0].split('-');
        const id = jobURlSplit[jobURlSplit.length - 1];
        if (!this.queryOptions.checkWordInBlackList(jobTitle))
          if (this.queryOptions.checkWordInWhiteList(jobTitle)) {
            const isJobExist = jobs.find((el) => el.jobID === id);
            const isLogExist = logs.find((el) => el.logID === id);

            if (!isJobExist && !isLogExist) {
              const isRequirementValid = await puppeteerDOM.initPuppeteer(
                link,
                '.show-more-less-html ul *'
              );

              if (isRequirementValid.pass) {
                const company = element.find('h4.base-search-card__subtitle').text().trim();
                const location = element.find('span.job-search-card__location').text().trim();

                curJobs.push({
                  jobID: id,
                  jobTitle,
                  company,
                  location,
                  link: link || '',
                });
              } else {
                curLogs.push({
                  link: link,
                  logID: id,
                  reason: isRequirementValid.reason,
                  title: jobTitle,
                });
              }
            }
          }
      }
    }

    return { curJobs, curLogs, length: elements.length };
  }

  async scanning(puppeteerDOM: PuppeteerDOM, queryOptions: Query, jobs: Job[], logs: Log[]) {
    let start = 0;
    while (start < queryOptions.limit) {
      const html = await this.getHTML(start);
      const { curLogs, curJobs, length } = await this.getJobData(puppeteerDOM, html, jobs, logs);
      console.log('jobs were found', length);
      if (length === 0) return { curJobs: this.jobs, curLogs: this.logs };
      this.jobs = [...this.jobs, ...curJobs];
      this.logs = [...this.logs, ...curLogs];
      start += 25;
    }

    return { curJobs: this.jobs, curLogs: this.logs };
  }
}
