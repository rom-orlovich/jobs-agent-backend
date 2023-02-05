import axios from 'axios';

import puppeteer from 'puppeteer';
import { Job } from '../lib/types/linkedinScanner';
import { Scanner } from './Scanner';
import { GoogleTranslateScanner } from '../src/GoogleTranslateScanner';
import { RequirementsReader } from '../lib/RequirementsReader';
import { Profile } from '../lib/Profile';

import { AllJobsQueryOptions } from '../lib/AllJobQueryOptions';
import { load } from 'cheerio';
import { PuppeteerSetup } from '../lib/PuppeteerSetup';

export type JobPost = Job & { text: string };
export class AllJobScanner extends Scanner<AllJobsQueryOptions, any, any> {
  constructor(queryOptions: AllJobsQueryOptions, profile: Profile) {
    super(queryOptions, profile);
  }
  getURL(page = 1) {
    return `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=${page}&position=1712&type=37&source=779&duration=20&exc=&region=`;
  }

  async getJobPostsData(page = 1) {
    const html = await this.getAxiosData<string>(page);
    const $ = load(html || '');
    const numPages = Number($('#hdnTotalPages').val());
    const curPage = Number($('#hdnCurrentPageNumber').val());
    const data = $('.job-content-top')
      .toArray()
      .map((el) => {
        const titleEl = $(el).find('.job-content-top a[title]');
        const title = titleEl.text().trim();
        const link = `https://www.alljobs.co.il` + titleEl.attr('href') || '';
        const linkSplit = link.split('=');
        const jobID = linkSplit[linkSplit.length - 1];
        const company = $(el).find('.T14 a').text().trim();
        const location = $(el).find('.job-content-top-location a').text().trim();
        const text = $(el).find('.job-content-top-desc').text().trim();

        return { jobID, title, link, company, location, text, from: 'allJobs' };
      });
    return { data, curPage, numPages };
  }
  async initPuppeteer(data: JobPost[], preJobs: Job[]) {
    const jobs: Job[] = [];
    // const googleTranslateScanner = new GoogleTranslateScanner({
    //   op: 'translate',
    //   to: 'en',
    //   from: 'he',
    // });

    const { browser, page } = await PuppeteerSetup.lunchInstance({ defaultViewport: null });

    for (const { text, ...jobPost } of data) {
      if (!jobPost.link || !jobPost.jobID || !jobPost.title || !text) continue;
      if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;
      if (preJobs.find((el) => el.jobID === jobPost.jobID)) continue;

      const translateText = await this.googleTranslate.goTranslate(page, text);

      console.log('translateText', translateText);
      const { reason, count } = RequirementsReader.checkIsRequirementsMatch(translateText, this.profile);

      // const newJob = { ...jobPost };
      const newJob = { ...jobPost, reason };

      console.log(newJob, `${count} words`);
      jobs.push(newJob);
    }
    await browser.close();
    return jobs;
  }

  async scanning(preJobs: Job[]) {
    const jobsPost: JobPost[] = [];

    const { curPage, data, numPages } = await this.getJobPostsData(0);

    let firstResult = undefined;

    while (curPage < numPages) {
      console.log(`Page number ${page}`);
      firstResult = data[0].jobID;

      data = await this.getJobPostsData(page);
      jobsPost.push(...data);
      page++;
    }

    const jobs = await this.initPuppeteer(jobsPost, preJobs);
    // const jobs = await this.initPuppeteer(jobsPost, profile, preJobs);

    console.log(`finish found ${jobs.length} jobs in allJobs`);
    return jobs;
  }
}

// (async () => {
//   const allJobScanner = new AllJobScanner(queryOptions);

//   await allJobScanner.scanning(profile);
//   console.log('finish');
// })();
