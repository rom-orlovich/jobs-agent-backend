import axios from 'axios';
import { CheerioDom } from '../lib/CheerioDom';

import { Query } from '../lib/Query';
import { Job } from '../lib/types/linkedinScrapper';
import { createHash } from 'crypto';

import { PuppeteerDOM } from '../lib/PuppeteerDOM';
console.log(process.env.NODE_ENV);
export class LinkedinScan {
  queryOptions: Query;
  jobs: Job[];
  constructor(queryOptions: Query) {
    this.jobs = [];
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

  async getJobData(puppeteerDOM: PuppeteerDOM, html: string) {
    const cheerioDOM = new CheerioDom(html);
    const elements = cheerioDOM.toArray('li');
    console.log(elements.length);
    if (elements.length === 0) return [];
    const curJobs: Job[] = [];

    for (const element of elements.slice(0, 2)) {
      const jobTitle = element.find('h3.base-search-card__title').text().trim();

      if (!this.queryOptions.checkWordInBlackList(jobTitle))
        if (this.queryOptions.checkWordInWhiteList(jobTitle)) {
          const link = element.find('a.base-card__full-link').attr('href');

          if (link) {
            const isRequirementValid =
              process.env.NODE_ENV === 'test'
                ? true
                : await puppeteerDOM.initPuppeteer(link, '.show-more-less-html ul *');

            if (isRequirementValid) {
              const company = element.find('h4.base-search-card__subtitle').text().trim();
              const location = element.find('span.job-search-card__location').text().trim();
              const jobID = createHash('md5').update(link).digest('hex');
              curJobs.push({
                jobID: jobID,
                jobTitle,
                company,
                location,
                link: link || '',
              });
            }
          }
        }
    }

    return curJobs;
  }

  async scanning(puppeteerDOM: PuppeteerDOM, queryOptions: Query) {
    let start = 0;
    while (start < queryOptions.limit) {
      const html = await this.getHTML(start);
      const curJob = await this.getJobData(puppeteerDOM, html);
      if (curJob.length === 0) return this.jobs;
      this.jobs = [...this.jobs, ...curJob];
      start += 25;
    }
    console.log(this.jobs);
    return this.jobs;
  }
}
