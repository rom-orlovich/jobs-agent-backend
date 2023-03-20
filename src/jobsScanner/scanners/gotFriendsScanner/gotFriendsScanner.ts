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
    console.log(
      'radioAreas',
      radioAreas,
      'checkboxProfessions',
      checkboxProfessions,
      'location',
      location
    );
    await page.click('#professionAreaTitle');
    await page.click(`label[for='${radioAreas}']`);
    await page.click('#professionTitle');
    await page.click(`label[for='${checkboxProfessions}']`);
    await page.click('#regionTitle');
    await page.click(`li label[for='${location}']`);
    await page.click('#searchButton');
  }

  //Sometimes the clicks on the filter inputs are failed.
  private async clickOnFiltersUntilSuccess(page: Page) {
    let numTry = 1;
    await untilSuccess(async () => {
      if (numTry >= 3) return await Promise.resolve();
      numTry++;
      await this.initialFilters(page);
    });

    return numTry >= 3;
  }

  private async getNumPagesLinks(page: Page) {
    try {
      await page.waitForSelector('.pagination li a', { timeout: 10000 });
      const numPagesLinks = await page.$$eval('.pagination li a', (el) => el.map((el) => el.href));
      return numPagesLinks;
    } catch (error) {
      return [];
    }
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

  private async getJobsFromPage(page: Page, url?: string) {
    let jobs: Job[] = [];
    await untilSuccess(async () => {
      if (url) await page.goto(url);
      jobs = await page.evaluate(this.getAllJobsPostData, this.scannerName);
    });
    const filterJobs = this.getFilterResults(jobs);
    return filterJobs;
  }

  private getJobsFromEachPage(browser: Browser) {
    return async (url: string) => {
      const newPage = await browser.newPage();
      console.log(url);
      // let jobs: Job[] = [];
      // await untilSuccess(async () => {
      //   await newPage.goto(url);
      //   jobs = await newPage.evaluate(this.getAllJobsPostData, this.scannerName);
      // });
      // const filterJobs = this.getFilterResults(jobs);
      const jobs = await this.getJobsFromPage(newPage, url);
      await newPage.close();
      return jobs;
    };
  }

  private async initPuppeteer() {
    const { browser, page } = await PuppeteerSetup.lunchInstance({
      slowMo: Scanner.SLOW_MOV,
    });

    await page.goto('https://www.gotfriends.co.il/jobs/');

    const failed = await this.clickOnFiltersUntilSuccess(page);

    //If the clicks on the filter inputs are failed.
    if (failed) return [];
    const numPagesLinks = await this.getNumPagesLinks(page);
    let promises: Promise<Job[]>[] = [];
    if (numPagesLinks.length)
      promises = numPagesLinks
        .slice(0, 50)
        .map(throat(Scanner.THROAT_LIMIT, this.getJobsFromEachPage(browser)));
    else {
      promises = [this.getJobsFromPage(page)];
    }

    const jobs = await this.getTranslateResultsScanning(promises);
    await browser.close();

    return jobs;
  }

  async scanning(): Promise<Job[]> {
    if (
      !this.gotFriendsQuery.checkboxProfessions ||
      !this.gotFriendsQuery.radioAreas ||
      !this.gotFriendsQuery.location
    ) {
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
