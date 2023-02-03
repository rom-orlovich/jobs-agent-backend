import { RequirementsReader } from '../lib/RequirementsReader';
import { GoogleTranslateQuery } from '../lib/types/google-translate';

import { Scanner, TaskProps } from './Scanner';

import { GoogleTranslateScanner } from './GoogleTranslateScanner';
import puppeteer, { Page } from 'puppeteer';
import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { GotFriendQueryOptions } from '../lib/GotFriendsQuery';
import { Job } from '../lib/types/linkedinScanner';
import { Profile } from '../lib/Profile';
import { JobsDB } from '../lib/JobsDB';

export class GotFriendsScan extends Scanner<GotFriendQueryOptions, TaskProps, void> {
  JobsDB: JobsDB;
  constructor(queryOptions: GotFriendQueryOptions, JobsDB: JobsDB) {
    super(queryOptions);
    this.JobsDB = JobsDB;
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
    const jobsPosts = Array.from(document.querySelectorAll('.panel .item'));

    return jobsPosts.map((job) => {
      const jobLink = job.querySelector<HTMLAnchorElement>('a.position');
      const link = 'https://www.gotfriends.co.il' + jobLink?.href || '';
      const text = job.querySelector('.desc')?.textContent || '';
      const jobID = job.querySelector('.career_num')?.textContent?.split(':')[1].trim() || '';
      const title = jobLink?.textContent?.trim().replace(/\n/, '') || '';

      const location = job.querySelector('.info-data')?.textContent?.trim() || '';

      return { link, title, jobID, location, company: '', from: 'gotFriends', text };
    });
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

        for (const { text, ...jobPost } of jobsPosts) {
          if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;

          const googleTranslate = new GoogleTranslateScanner({
            op: 'translate',
            to: 'en',
            text,
          });

          const string = await data.cluster?.execute({ text }, googleTranslate.taskCreator());

          const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(string, data.profile);

          const newJob = { ...jobPost, reason };
          console.log(newJob);
          // await data.JobsDB.insertOne(newJob);
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
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      slowMo: 250,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await this.noImageRequest(page);
    await page.goto('https://www.gotfriends.co.il/jobs/');

    await this.initialFilters(page);
    let i = 0;

    while (i < 20) {
      const nav = await page.waitForSelector('a.position');
      if (nav) console.log(`page number ${i + 1}`);
      const jobsPosts = await page.evaluate(GotFriendsScan.getAllJobsData);

      for (const { text, ...jobPost } of jobsPosts) {
        console.log(jobPost.link);
        if (!jobPost.link || !jobPost.jobID || !jobPost.title) continue;
        if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;
        const job = await this.JobsDB?.getJob(jobPost.jobID);
        if (job) continue;
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
        const { reason } = RequirementsReader.checkIsRequirementsMatch(translateText, profile);

        const newJob = { ...jobPost, reason };
        console.log(newJob);
        this.JobsDB.insertOne(newJob);
      }

      i++;
      await page.click('#rightLeft a');
    }

    await browser.close();
    console.log('finish');
  }
}
