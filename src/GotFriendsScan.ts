import { RequirementsReader } from '../lib/RequirementsReader';
import { GoogleTranslateQuery } from '../lib/types/google-translate';

import { load } from 'cheerio';
import { Scanner, TaskProps } from './Scanner';

import { GoogleTranslateScanner } from './GoogleTransalteScanner';
import { Page } from 'puppeteer';
import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { GotFriendQueryOptions } from '../lib/GotFriendsQuery';

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
    await page.click(`label[for='checkboxProfessions-1970']`);
    await page.click(`label[for='checkboxProfessions-1947']`);
    await page.click(`label[for='checkboxProfessions-1965']`);

    await page.click(`label[for='checkboxProfessions-8010']`);

    await page.click('#regionTitle');
    await page.click(`li label[for*='checkboxRegions-1']`);
    await page.click('#searchButton');
  }

  taskCreator(): TaskFunction<TaskProps, void> {
    const task: TaskFunction<TaskProps, void> = async ({ data, page }) => {
      let i = 0;
      await page.goto('https://www.gotfriends.co.il/jobs/');
      await this.initialFilters(page);
      while (i < 20) {
        const nav = await page.waitForSelector('a.position');
        if (nav) console.log(`page number ${i + 1}`);
        const html = await page.evaluate(() => {
          return document.body.innerHTML;
        });
        const $ = load(html);
        // const cheerio = new CheerioDom(html);
        const posts = $('.panel .item');
        console.log(posts.length);
        for (const post of posts) {
          const postAPI = $(post);
          const text = postAPI.find('.desc').text();
          const postLink = postAPI.find('a.position');
          const title = postLink.text().trim().replace(/\n/, '');
          if (this.queryOptions.checkWordInBlackList(title)) continue;
          const jobID = postAPI.find('.career_num').text().split(':')[1].trim();
          const link = 'https://www.gotfriends.co.il' + postLink.attr('href') || '';

          console.log('title', title);

          const job = await data.jobs.getJob(jobID);
          if (job) continue;

          const googleTranslate = new GoogleTranslateScanner({ op: 'translate', to: 'en', text: text });
          const string = await data.cluster?.execute({ text }, googleTranslate.taskCreator());

          const isRequirementsMatch = RequirementsReader.checkIsRequirementsMatch(string, data.profile);

          if (!isRequirementsMatch.pass) continue;
          const location = postAPI.find('.info-data').text().trim();
          const newJob = { company: '', jobID, title: title, link: link, location };
          console.log(newJob);
          await data.jobs.insertOne(newJob);
        }
        i++;
        await page.click('#rightLeft a');
      }
      console.log('finish');
    };
    return task;
  }
}
