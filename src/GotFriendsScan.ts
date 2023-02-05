import { Scanner, TaskProps } from './Scanner';

import { GotFriendQueryOptions } from '../lib/GotFriendsQuery';
import { Job } from '../lib/types/linkedinScanner';
import { Profile } from '../lib/Profile';
import { JobsDB } from '../lib/JobsDB';
import { PuppeteerSetup } from '../lib/PuppeteerSetup';
import throat from 'throat';
import { Page } from 'puppeteer';

export class GotFriendsScan extends Scanner<GotFriendQueryOptions, TaskProps, any> {
  JobsDB: JobsDB;

  constructor(queryOptions: GotFriendQueryOptions, profile: Profile, JobsDB: JobsDB) {
    super(queryOptions, profile);
    this.JobsDB = JobsDB;
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
  getAllJobsData(preJobs: Job[]) {
    const jobsPosts = Array.from(document.querySelectorAll('.panel .item'));
    return jobsPosts
      .map((job) => {
        const jobLink = job.querySelector<HTMLAnchorElement>('a.position');
        const link = jobLink?.href || '';
        const text = job.querySelector('.desc')?.textContent || '';
        const jobID = job.querySelector('.career_num')?.textContent?.split(':')[1].trim() || '';
        const title = jobLink?.textContent?.trim().replace(/\n/, '') || '';
        const location = job.querySelector('.info-data')?.textContent?.trim() || '';
        return { link, title, jobID, location, company: '', from: 'gotFriends', text };
      })
      .filter((jobPost) => {
        if (!jobPost.link || !jobPost.jobID || !jobPost.title || !jobPost.text) return false;
        if (this.queryOptions.checkWordInBlackList(jobPost.title)) return false;
        if (preJobs.find((el) => el.jobID === jobPost.jobID)) return false;
        return true;
      });
  }

  // taskCreator(): TaskFunction<TaskProps, void> {
  //   const task: TaskFunction<TaskProps, void> = async ({ data, page }) => {
  //     let i = 0;
  //     const jobs: Job[] = [];
  //     await page.goto('https://www.gotfriends.co.il/jobs/');
  //     await this.initialFilters(page);
  //     while (i < 20) {
  //       const nav = await page.waitForSelector('a.position');
  //       if (nav) console.log(`page number ${i + 1}`);
  //       const jobsPosts = await page.evaluate(GotFriendsScan.getAllJobsData);

  //       for (const { text, ...jobPost } of jobsPosts) {
  //         if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;

  //         const googleTranslate = new GoogleTranslateScanner({
  //           op: 'translate',
  //           to: 'en',
  //           text,
  //         });

  //         const string = await data.cluster?.execute({ text }, googleTranslate.taskCreator());

  //         const { pass, reason } = RequirementsReader.checkIsRequirementsMatch(string, data.profile);

  //         const newJob = { ...jobPost, reason };
  //         console.log(newJob);
  //         // await data.JobsDB.insertOne(newJob);
  //         jobs.push(newJob);
  //       }
  //       i++;
  //       await page.click('#rightLeft a');
  //     }
  //     console.log('finish');
  //   };
  //   return task;
  // }

  async initPuppeteer(preJobs: Job[]) {
    const jobs: Job[] = [];
    const { browser, page } = await PuppeteerSetup.lunchInstance({ defaultViewport: null, slowMo: 200 });
    await page.goto('https://www.gotfriends.co.il/jobs/');
    await this.initialFilters(page);

    // let i = 0;
    // const googleTranslateScanner = new GoogleTranslateScanner({
    //   op: 'translate',
    //   to: 'en',
    //   from: 'he',
    // });
    const curURL = page.url();
    const numPages = await page.$$eval('.pagination li a', (el) =>
      el.map((el) => curURL + el.href.split('=').at(-1))
    );

    const promises = numPages.slice(0, 20).map(
      throat(2, async (url) => {
        const newPage = await browser.newPage();
        await newPage.goto(url);
        const data = await page.evaluate(this.getAllJobsData, preJobs);
        console.log(`finish found ${data.length} jobs in gotFriends`);
        await newPage.close();
        return data;
      })
    );

    const results = await Promise.all(promises);
    await browser.close();

    // const jobsPosts = await page.evaluate(this.getAllJobsData, preJobs);

    // await Promise.all([page.waitForNavigation(), page.click('#rightLeft a')])
    // while (i < Number(numPages || 0)) {
    //   const nav = await page.waitForSelector('a.position');
    //   if (nav) console.log(`page number ${i + 1}`);
    //   const jobsPosts = await page.evaluate(this.getAllJobsData, preJobs);
    //   jobs.push(...jobsPosts);
    //   // for (const { text, ...jobPost } of jobsPosts) {
    //   //   console.log(jobPost.link);
    //   //   if (!jobPost.link || !jobPost.jobID || !jobPost.title || !text) continue;
    //   //   if (this.queryOptions.checkWordInBlackList(jobPost.title)) continue;
    //   //   if (preJobs.find((el) => el.jobID === jobPost.jobID)) continue;
    //   //   // const job = await this.JobsDB?.getJob(jobPost.jobID);
    //   //   // if (job) continue;

    //   //   // const GTPage = await browser.newPage();

    //   //   // const translateText = await googleTranslateScanner.goTranslate(GTPage, text);

    //   //   // await GTPage.close();
    //   //   // const string = await data.cluster?.execute({ text }, googleTranslate.taskCreator());
    //   //   // const { reason } = RequirementsReader.checkIsRequirementsMatch(translateText, this.profile);

    //   //   // const newJob = { ...jobPost, reason };
    //   //   //         console.log(newJob);
    //   //   // jobs.push(newJob);
    //   //   // this.JobsDB.insertOne(newJob);
    //   // }

    //   i++;
    //   await Promise.all([page.waitForNavigation(), page.click('#rightLeft a')]);
    // }

    return results.flat(1);
  }

  async scanning(preJobs: Job[]): Promise<Job[]> {
    const results = await this.initPuppeteer(preJobs);
    const jobs = await this.translateText(results);
    return jobs;
  }
}
