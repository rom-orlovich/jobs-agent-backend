import { RequirementsReader } from '../lib/RequirementsReader';
import { GoogleTranslateQuery } from '../lib/types/google-translate';

import { load } from 'cheerio';
import { Scanner, TaskProps } from './Scanner';

import { GoogleTranslateScanner } from './GoogleTransalteScanner';
import puppeteer, { Page } from 'puppeteer';
import Cluster, { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { GotFriendQueryOptions } from '../lib/GotFriendsQuery';
import { Job } from '../lib/types/linkedinScanner';
import { Profile } from '../lib/Profile';

export class GotFriendsScan extends Scanner<GotFriendQueryOptions, TaskProps, void> {
  constructor(queryOptions: GotFriendQueryOptions) {
    super(queryOptions);
  }

  getGoogleTranslateQuery(opt: GoogleTranslateQuery): string {
    const { text, to, op } = opt;
    if (!text) return '';
    const from: string = opt.from || 'auto';
    if (opt.op === 'translate') {
      if (text.length > 5000) return '';
      if (text.length === 0) return '';
    }
    return `?text=${encodeURIComponent(text)}&sl=${from}&tl=${to}&op=${op}`;
  }

  private async initialFilters(page: Page) {
    await page.click('#professionAreaTitle');
    await page.click(`label[for='radioAreas-1108']`);

    await page.click('#professionTitle');
    try {
      await page.waitForSelector("label[for='checkboxProfessions-1970']");
    } catch (error) {
      await page.click('#professionTitle');
    }

    await page.click(`label[for='checkboxProfessions-1970']`);
    await page.click(`label[for='checkboxProfessions-1947']`);
    await page.click(`label[for='checkboxProfessions-1965']`);
    await page.click(`label[for='checkboxProfessions-8010']`);

    await page.click('#regionTitle');

    try {
      await page.waitForSelector("li label[for*='checkboxRegions-1']");
    } catch (error) {
      await page.click('#regionTitle');
    }

    await page.click(`li label[for*='checkboxRegions-1']`);
    await page.click('#searchButton');
  }
  static getAllJobsData() {
    const jobsEl = Array.from(document.querySelectorAll('.panel .item'));
    const jobs: (Job & { text: string })[] = [];
    for (const job of jobsEl) {
      const jobLink = job.querySelector<HTMLAnchorElement>('a.position');
      const link = 'https://www.gotfriends.co.il' + jobLink?.href || '';
      const text = job.querySelector('.desc')?.textContent || '';
      const jobID = job.querySelector('.career_num')?.textContent?.split(':')[1].trim() || '';
      const title = jobLink?.textContent?.trim().replace(/\n/, '') || '';
      if (!title || !jobLink || !text || !jobID) continue;

      const location = job.querySelector('.info-data')?.textContent?.trim() || '';

      jobs.push({ link, title, jobID, location, company: '', from: 'gotFriends', text });
    }
    return jobs;
  }

  taskCreator(): TaskFunction<TaskProps, void> {
    const task: TaskFunction<TaskProps, void> = async ({ data, page }) => {
      let i = 0;
      const jobs: Job[] = [];
      await page.goto('https://www.gotfriends.co.il/jobs/');
      await this.initialFilters(page);
      while (i < 20) {
        const nav = await page.waitForSelector('a.position');
        if (nav) console.log(`page number ${i + 1}`);
        const jobsPosts = await page.evaluate(GotFriendsScan.getAllJobsData);
        // const $ = load(html);
        // const cheerio = new CheerioDom(html);
        // const posts = $('.panel .item');

        for (const { text, ...jobPost } of jobsPosts) {
          // const postAPI = $(post);
          // // const text = postAPI.find('.desc').text();
          // const postLink = postAPI.find('a.position');
          // const title = postLink.text().trim().replace(/\n/, '');

          if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;
          // const jobID = postAPI.find('.career_num').text().split(':')[1].trim();
          // const link = 'https://www.gotfriends.co.il' + postLink.attr('href') || '';

          // console.log('title', title);

          // const job = await data.jobsDB.getJob(jobID);
          // if (job) continue;
          // const text = await page.$eval('.desc', (el) => el.textContent);
          // if (!text) continue;
          const googleTranslate = new GoogleTranslateScanner({
            op: 'translate',
            to: 'en',
            text,
          });

          const string = await data.cluster?.execute({ text }, googleTranslate.taskCreator());

          const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(string, data.profile);

          const newJob = { ...jobPost, reason };
          console.log(newJob);
          // await data.jobsDB.insertOne(newJob);
          jobs.push(newJob);
        }
        i++;
        await page.click('#rightLeft a');
      }
      console.log('finish');
    };
    return task;
  }

  async initPuppeteer(profile: Profile) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, slowMo: 250 });
    const page = await browser.newPage();
    await this.noImageRequest(page);
    await page.goto('https://www.gotfriends.co.il/jobs/');

    await this.initialFilters(page);
    let i = 0;
    const jobs: Job[] = [];
    while (i < 20) {
      const nav = await page.waitForSelector('a.position');
      if (nav) console.log(`page number ${i + 1}`);
      const jobsPosts = await page.evaluate(GotFriendsScan.getAllJobsData);

      for (const { text, ...jobPost } of jobsPosts) {
        if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;
        const googleTranslate = new GoogleTranslateScanner({
          op: 'translate',
          to: 'en',
          text,
        });
        const GTPage = await browser.newPage();
        await googleTranslate.goTranslatePage(GTPage);
        const translateText = await GTPage.evaluate(GoogleTranslateScanner.getTranslate);
        await GTPage.close();
        // const string = await data.cluster?.execute({ text }, googleTranslate.taskCreator());
        const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(translateText, profile);

        const newJob = { ...jobPost, reason };
        console.log(newJob);
        jobs.push(newJob);
      }

      i++;
      await page.click('#rightLeft a');
    }
    console.log('finish');

    await browser.close();
  }
}
