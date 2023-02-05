import axios from 'axios';

import puppeteer from 'puppeteer';
import { Job } from '../lib/types/linkedinScanner';
import { Scanner } from './Scanner';
import { GoogleTranslateScanner } from '../src/GoogleTranslateScanner';
import { RequirementsReader } from '../lib/RequirementsReader';
import { Profile } from '../lib/Profile';

import { AllJobsQueryOptions } from '../lib/AllJobQueryOptions';
import { load } from 'cheerio';

export type JobPost = Job & { text: string };
export class AllJobScanner extends Scanner<AllJobsQueryOptions, any, any> {
  getURL(page = 1) {
    return `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=${page}&position=1712&type=37&source=779&duration=20&exc=&region=`;
  }

  async getHTML(page: number): Promise<string> {
    console.log(this.getURL(page));
    try {
      const res = await axios(this.getURL(page));
      const data = res.data;
      return data;
    } catch (error) {
      return '';
    }
  }

  async getJobPostsData(page = 1) {
    const html = await this.getHTML(page);
    const $ = load(html);

    return $('.job-content-top')
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
  }
  async initPuppeteer(data: JobPost[], profile: Profile, preJobs: Job[]) {
    const jobs: Job[] = [];
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });
    const GTPage = await browser.newPage();
    await this.noImageRequest(GTPage);

    for (const { text, ...jobPost } of data) {
      if (!jobPost.link || !jobPost.jobID || !jobPost.title || !text) continue;
      if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;
      if (preJobs.find((el) => el.jobID === jobPost.jobID)) continue;
      const googleTranslateScanner = new GoogleTranslateScanner({
        op: 'translate',
        to: 'en',
        text,
      });

      const translateText = await googleTranslateScanner.goTranslate(GTPage);

      console.log('translateText', translateText);
      const { reason, count } = RequirementsReader.checkIsRequirementsMatch(translateText, profile);

      // const newJob = { ...jobPost };
      const newJob = { ...jobPost, reason };

      console.log(newJob, `${count} words`);
      jobs.push(newJob);
    }
    await browser.close();
    return jobs;
  }

  async scanning(profile: Profile, preJobs: Job[]) {
    const jobs: Job[] = [];
    let data: JobPost[] = [];
    let page = 1;
    data = await this.getJobPostsData(page);

    let firstResult = undefined;

    while (data[0].jobID !== firstResult) {
      console.log(`Page number ${page}`);
      firstResult = data[0].jobID;

      jobs.push(...(await this.initPuppeteer(data, profile, preJobs)));
      page++;
      data = await this.getJobPostsData(page);
    }

    console.log(`finish found ${jobs.length} jobs in allJobs`);
    return jobs;
  }
}

// (async () => {
//   const allJobScanner = new AllJobScanner(queryOptions);

//   await allJobScanner.scanning(profile);
//   console.log('finish');
// })();
