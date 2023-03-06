import { Scanner } from '../scanner';

import { GotFriendQueryOptions } from './gotFriendsQuery';

import throat from 'throat';

import { Browser, Page } from 'puppeteer';

import { UserEntity } from '../../user/userEntity.types';
import { JobsDB } from '../../../../mongoDB/jobsDB/jobsDB';

import { untilSuccess } from '../../../../lib/utils';
import { PuppeteerSetup } from '../../../../lib/puppeteerSetup';
import { Job } from '../../../../mongoDB/jobsDB/jobsDB.types';

export class GotFriendsScanner extends Scanner {
  gotFriendsQuery: GotFriendQueryOptions;

  constructor(user: UserEntity, JobsDB: JobsDB) {
    super('gotFriends', user, JobsDB);
    this.gotFriendsQuery = new GotFriendQueryOptions(user.getLastQuery());
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

  private async clickOnFiltersUntilSuccess(page: Page) {
    let maxTry = 1;
    untilSuccess(async () => {
      await this.initialFilters(page);
      maxTry++;
    }, maxTry <= 3);
  }

  private async getNumPagesLinks(page: Page) {
    await page.waitForSelector('.pagination li a');
    const numPagesLinks = await page.$$eval('.pagination li a', (el) => el.map((el) => el.href));
    return numPagesLinks;
  }

  getAllJobsPostData(scannerName: string) {
    const jobs = Array.from(document.querySelectorAll('.panel .item'));
    return jobs.map((job) => {
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
      };
    });
  }

  private async getFilterResults(jobs: Job[]) {
    const filterJobs = jobs.filter(this.filterJobs);
    const filterJobsFromDB = await this.filterJobsExistInDB(
      filterJobs,
      this.gotFriendsQuery.userQuery.hash
    );
    return filterJobsFromDB;
  }

  private getJobsFromEachPage(browser: Browser) {
    return async (url: string) => {
      const newPage = await browser.newPage();
      console.log(url);
      let jobs: Job[] = [];
      await untilSuccess(async () => {
        await newPage.goto(url);
        jobs = await newPage.evaluate(this.getAllJobsPostData, this.scannerName);
      });
      const filterJobs = this.getFilterResults(jobs);
      await newPage.close();
      return filterJobs;
    };
  }

  private async initPuppeteer() {
    const { browser, page } = await PuppeteerSetup.lunchInstance({
      // headless: false,
      defaultViewport: null,
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-gpu'],
      slowMo: Scanner.SLOW_MOV,
    });

    await page.goto('https://www.gotfriends.co.il/jobs/');

    // await this.initialFilters(page);
    await this.clickOnFiltersUntilSuccess(page);
    const numPagesLinks = await this.getNumPagesLinks(page);

    const promises = numPagesLinks
      .slice(0, 50)
      .map(throat(Scanner.THROAT_LIMIT, this.getJobsFromEachPage(browser)))
      .flat(1);

    const jobs = await this.getTranslateResultsScanning(promises);
    await browser.close();

    return jobs;
  }

  async scanning(): Promise<Job[]> {
    if (!this.gotFriendsQuery.checkboxProfessions || !this.gotFriendsQuery.radioAreas) {
      console.log('There are no jobs in GotFriends that match the query.');
      return [];
    }
    const results = await this.initPuppeteer();
    return results;
  }
}
// (async () => {
//   const got = new GotFriendsScanner(EXAMPLE_QUERY, profile, new JobsDB());
//   const t = await got.scanning([]);
//   console.log('Finish scanning');
//   console.log(t);
// })();
