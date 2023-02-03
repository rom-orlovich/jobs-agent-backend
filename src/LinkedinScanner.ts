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
    };
    return task;
  }
}
