import axios from 'axios';
import { CheerioDom } from './CheerioDom';
import { Profile } from './Profile';
import { Query } from './Query';
import { Job } from './types/linkedinScrapper';
import { createHash } from 'crypto';
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

  getJobData(profile: Profile, html: string) {
    const cheerioDOM = new CheerioDom(html);
    const elements = cheerioDOM.toArray('li');
    if (elements.length === 0) return [];
    const hash = createHash('sha256');
    return elements.reduce((pre, cur) => {
      const jobTitle = cur.find('h3.base-search-card__title').text().trim();
      if (this.queryOptions.checkWordInBlackList(jobTitle)) return pre;

      if (this.queryOptions.checkWordInWhiteList(jobTitle)) {
        const company = cur.find('h4.base-search-card__subtitle').text().trim();
        const location = cur.find('span.job-search-card__location').text().trim();
        const link = cur.find('a.base-card__full-link').attr('href');
        const jobID = hash.update(link || jobTitle + location + company).digest('hex');
        pre.push({
          jobID: jobID,
          jobTitle,
          company,
          location,
          link: link || '',
        });
      }

      return pre;
    }, [] as unknown as Job[]);
  }

  async scanning(profile: Profile, queryOptions: Query) {
    let start = 0;
    while (start < queryOptions.limit) {
      const html = await this.getHTML(start);
      const curJob = this.getJobData(profile, html);
      if (curJob.length === 0) return this.jobs;
      this.jobs.push(...curJob);
      start += 25;
    }
    return this.jobs;
  }
}
