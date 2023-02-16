import { Scanner } from '../Scanner';

import { GotFriendQueryOptions } from './GotFriendsQuery';

import { Profile } from '../Profile/Profile';
import { JobsDB } from '../../lib/JobsDB';
import { PuppeteerSetup } from '../../lib/PuppeteerSetup';
import throat from 'throat';

import { UserQuery } from '../GeneralQuery/generalQuery';
import { Browser, Page } from 'puppeteer';
import { untilSuccess } from '../../lib/utils';
import { JobPost } from '../JobsScanner/jobsScanner';
import { exampleQuery, profile } from '../..';

export class GotFriendsScanner extends Scanner {
  gotFriendsQuery: GotFriendQueryOptions;

  constructor(userInput: UserQuery, profile: Profile, JobsDB: JobsDB) {
    super('gotFriends', profile, JobsDB);
    this.gotFriendsQuery = new GotFriendQueryOptions(userInput);
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

  private async getNumPagesLinks(page: Page) {
    await page.waitForSelector('.pagination li a');
    const numPagesLinks = await page.$$eval('.pagination li a', (el) => el.map((el) => el.href));
    return numPagesLinks;
  }

  private getAllJobsPostData(scannerName: string, addedAt: Date) {
    const jobsPosts = Array.from(document.querySelectorAll('.panel .item'));
    return jobsPosts.map((job) => {
      const jobLink = job.querySelector<HTMLAnchorElement>('a.position');
      const link = jobLink?.href || '';
      const text = job.querySelector('.desc:nth-of-type(2)')?.textContent || '';
      const jobID = job.querySelector('.career_num')?.textContent?.split(':')[1].trim() || '';
      const title = jobLink?.textContent?.trim().replace(/\n/, '') || '';
      const location = job.querySelector('.info-data')?.textContent?.trim() || '';

      return {
        link,
        title,
        jobID,
        location,
        company: '',
        from: scannerName,
        text,
        addedAt: addedAt,
      };
    });
  }

  private async getFilterResults(jobsPosts: JobPost[]) {
    const filterJobs = jobsPosts.filter(this.filterJobsPosts);
    const filterJobsFromDB = await this.filterJobsExistInDB(filterJobs, this.gotFriendsQuery.hash);
    return filterJobsFromDB;
  }

  private getJobsFromEachPage(browser: Browser) {
    return async (url: string) => {
      const newPage = await browser.newPage();
      console.log(url);
      let jobsPosts: JobPost[] = [];
      await untilSuccess(async () => {
        await newPage.goto(url);
        jobsPosts = await newPage.evaluate(this.getAllJobsPostData, this.scannerName, new Date());
      });
      const filterJobs = this.getFilterResults(jobsPosts);
      await newPage.close();
      return filterJobs;
    };
  }

  private async initPuppeteer() {
    const { browser, page } = await PuppeteerSetup.lunchInstance({
      // headless: false,
      defaultViewport: null,
      args: ['--no-sandbox'],
      slowMo: 100,
    });

    await page.goto('https://www.gotfriends.co.il/jobs/');
    await this.initialFilters(page);
    const numPagesLinks = await this.getNumPagesLinks(page);

    const promises = numPagesLinks
      .slice(0, 50)
      .map(throat(10, this.getJobsFromEachPage(browser)))
      .flat(1);

    const jobsPosts = await this.getTranslateResultsScanning(promises);
    await browser.close();

    return jobsPosts;
  }

  async scanning(): Promise<JobPost[]> {
    if (!this.gotFriendsQuery.checkboxProfessions || !this.gotFriendsQuery.radioAreas) {
      console.log('There are no jobs in GotFriends that match the query.');
      return [];
    }
    const results = await this.initPuppeteer();
    return results;
  }
}
// (async () => {
//   const got = new GotFriendsScanner(exampleQuery, profile, new JobsDB());
//   const t = await got.scanning([]);
//   console.log('Finish scanning');
//   console.log(t);
// })();
