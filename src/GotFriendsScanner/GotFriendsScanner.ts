import { Scanner } from '../Scanner';

import { GotFriendQueryOptions } from './GotFriendsQuery';

import { Profile } from '../Profile/Profile';
import { JobsDB } from '../../lib/JobsDB';
import { PuppeteerSetup } from '../../lib/PuppeteerSetup';
import throat from 'throat';

import { UserInput } from '../GeneralQuery';
import { Page } from 'puppeteer';
import { untilSuccess } from '../../lib/utils';
import { Job, JobPost } from '../JobScan/jobScan';
import { exampleQuery, profile } from '../..';

export class GotFriendsScanner extends Scanner {
  JobsDB: JobsDB;
  gotFriendsQuery: GotFriendQueryOptions;

  constructor(userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super('gotFriends', profile);
    this.gotFriendsQuery = new GotFriendQueryOptions(userInput);
    this.JobsDB = JobsDB;
  }

  private async initialFilters(page: Page) {
    const { radioAreas, checkboxProfessions, location } = this.gotFriendsQuery;
    await page.click('#professionAreaTitle');
    await page.click(`label[for='${radioAreas}']`);

    await page.click('#professionTitle');
    await page.click(`label[for='${checkboxProfessions}']`);

    await page.click('#regionTitle');

    await page.click(`li label[for='${location}']`);
    await page.click('#searchButton');
  }
  getAllJobsPostData(scannerName: string) {
    const jobsPosts = Array.from(document.querySelectorAll('.panel .item'));

    return jobsPosts.map((job) => {
      const jobLink = job.querySelector<HTMLAnchorElement>('a.position');

      const link = jobLink?.href || '';
      const text = job.querySelector('.desc:nth-of-type(2)')?.textContent || '';
      const jobID = job.querySelector('.career_num')?.textContent?.split(':')[1].trim() || '';
      const title = jobLink?.textContent?.trim().replace(/\n/, '') || '';
      const location = job.querySelector('.info-data')?.textContent?.trim() || '';

      return { link, title, jobID, location, company: '', from: scannerName, text };
    });
  }

  async initPuppeteer(preJobs: Job[]) {
    const { browser, page } = await PuppeteerSetup.lunchInstance({
      // headless: false,
      defaultViewport: null,
      args: ['--no-sandbox'],
      slowMo: 100,
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
          let data: JobPost[] = [];
          await untilSuccess(async () => {
            await newPage.goto(url);
            data = (await newPage.evaluate(this.getAllJobsPostData, this.scannerName)).filter(
              (jobPost) => {
                if (!jobPost.link || !jobPost.jobID || !jobPost.title || !jobPost.text) return false;
                if (this.gotFriendsQuery.checkWordInBlackList(jobPost.title)) return false;
                if (preJobs.find((el) => el.jobID === jobPost.jobID)) return false;
                return true;
              }
            );
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
    if (!this.gotFriendsQuery.checkboxProfessions || !this.gotFriendsQuery.radioAreas) {
      console.log('There are no jobs in GotFriends that match the query.');
      return [];
    }
    const results = await this.initPuppeteer(preJobs);
    return results;
  }
}
// (async () => {
//   const got = new GotFriendsScanner(exampleQuery, profile, new JobsDB());
//   const t = await got.scanning([]);
//   console.log('Finish scanning');
//   console.log(t);
// })();
