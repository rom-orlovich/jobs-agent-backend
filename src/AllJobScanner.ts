import axios from 'axios';

import puppeteer from 'puppeteer';
import { Job } from '../lib/types/linkedinScanner';
import { Scanner } from './Scanner';
import { GoogleTranslateScanner } from '../src/GoogleTranslateScanner';
import { RequirementsReader } from '../lib/RequirementsReader';
import { Profile } from '../lib/Profile';
import { profile, queryOptions } from '../index';
import { AllFriendQueryOptions } from '../lib/AllJobQueryOptions';
import { load } from 'cheerio';

export class AllJobScanner extends Scanner<AllFriendQueryOptions, any, any> {
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
  async insertData(jobs: (Job & { text: string })[], profile: Profile) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      // slowMo: 250,
      // args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await this.noImageRequest(page);

    for (const { text, ...jobPost } of jobs) {
      if (!jobPost.link || !jobPost.jobID || !jobPost.title || !text) continue;
      if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;
      await GoogleTranslateScanner.goTranslatePage(page, {
        op: 'translate',
        to: 'en',
        text,
      });
      const translateText = await page.evaluate(GoogleTranslateScanner.getTranslate);

      console.log('translateText', translateText);
      const { reason, count } = RequirementsReader.checkIsRequirementsMatch(translateText, profile);

      // const newJob = { ...jobPost };
      const newJob = { ...jobPost, reason };

      console.log(newJob, `${count} words`);
    }
    await browser.close();
  }

  async scanning(profile: Profile) {
    // const jobs: Job[] = [];
    let data: (Job & { text: string })[] = [];
    let page = 1;
    data = await this.getJobPostsData(page);

    let firstResult = undefined;

    while (data[0].jobID !== firstResult) {
      console.log(`Page number ${page}`);
      firstResult = data[0].jobID;

      await this.insertData(data, profile);
      page++;
      data = await this.getJobPostsData(page);
    }
  }
}

(async () => {
  const allJobScanner = new AllJobScanner(queryOptions);

  await allJobScanner.scanning(profile);
  console.log('finish');
})();
