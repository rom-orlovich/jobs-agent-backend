import { Scanner, TaskProps } from './Scanner';

import { GotFriendQueryOptions } from '../lib/GotFriendsQuery';
import { Job } from '../lib/types/linkedinScanner';
import { Profile } from '../lib/Profile';
import { JobsDB } from '../lib/JobsDB';
import { PuppeteerSetup } from '../lib/PuppeteerSetup';
import throat from 'throat';

import { ScannerName, UserInput } from '../lib/GeneralQuery';
import { Page } from 'puppeteer';

export class GotFriendsScan extends Scanner {
  JobsDB: JobsDB;
  gotFriendsQuery: GotFriendQueryOptions;

  constructor(scannerName: ScannerName, userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super(scannerName, userInput, profile);
    this.gotFriendsQuery = new GotFriendQueryOptions(userInput);
    this.JobsDB = JobsDB;
  }

  private async initialFilters(page: Page) {
    const { radioAreas, checkboxProfessions, location } = this.gotFriendsQuery;
    await page.click('#professionAreaTitle');
    await page.click(`label[for='${radioAreas}']`);

    await page.click('#professionTitle');
    await page.click(`label[for='${checkboxProfessions}']`);
    // await page.click(`label[for='checkboxProfessions-1947']`);
    // await page.click(`label[for='checkboxProfessions-1965']`);
    // await page.click(`label[for='checkboxProfessions-8010']`);

    await page.click('#regionTitle');

    await page.click(`li label[for='${location}']`);
    await page.click('#searchButton');
    // const {}=this.gotFriendsQuery
    // await page.click('#professionAreaTitle');
    // await page.click(`label[for='radioAreas-1108']`);

    // await page.click('#professionTitle');
    // await page.click(`label[for='checkboxProfessions-1970']`);
    // await page.click(`label[for='checkboxProfessions-1947']`);
    // await page.click(`label[for='checkboxProfessions-1965']`);
    // await page.click(`label[for='checkboxProfessions-8010']`);

    // await page.click('#regionTitle');

    // await page.click(`li label[for='checkboxRegions-1']`);
    // await page.click('#searchButton');
  }
  getAllJobsData() {
    const jobsPosts = Array.from(document.querySelectorAll('.panel .item'));
    return jobsPosts.map((job) => {
      const jobLink = job.querySelector<HTMLAnchorElement>('a.position');
      const link = jobLink?.href || '';
      const text = job.querySelector('.desc')?.textContent || '';
      const jobID = job.querySelector('.career_num')?.textContent?.split(':')[1].trim() || '';
      const title = jobLink?.textContent?.trim().replace(/\n/, '') || '';
      const location = job.querySelector('.info-data')?.textContent?.trim() || '';
      return { link, title, jobID, location, company: '', from: this.scannerName, text };
    });
  }

  async initPuppeteer(preJobs: Job[]) {
    const { browser, page } = await PuppeteerSetup.lunchInstance({
      headless: true,
      defaultViewport: null,
      args: ['--no-sandbox'],
      slowMo: 75,
    });
    await page.goto('https://www.gotfriends.co.il/jobs/');
    await this.initialFilters(page);
    await page.waitForSelector('.pagination li a');

    const numPages = await page.$$eval('.pagination li a', (el) => {
      return el.map((el) => el.href);
    });

    const promises = numPages
      .slice(0, 20)
      .map(
        throat(10, async (url) => {
          const newPage = await browser.newPage();
          console.log(url);
          await newPage.goto(url);
          const data = (await newPage.evaluate(this.getAllJobsData)).filter((jobPost) => {
            if (!jobPost.link || !jobPost.jobID || !jobPost.title || !jobPost.text) return false;
            if (this.gotFriendsQuery.checkWordInBlackList(jobPost.title)) return false;
            if (preJobs.find((el) => el.jobID === jobPost.jobID)) return false;
            return true;
          });
          await newPage.close();
          return data;
        })
      )
      .flat(1);

    const jobs = await this.getResultScanning(promises);
    await browser.close();
    return jobs;
  }

  async scanning(preJobs: Job[]): Promise<Job[]> {
    const results = await this.initPuppeteer(preJobs);
    return results;
  }
}
// (async () => {
//   const lin = new GotFriendsScan('gotFriends', queryOptions, profile, new JobsDB());
//   const t = await lin.scanning([]);
// })();

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

//         const googleTranslate = new GoogleTranslate({
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
