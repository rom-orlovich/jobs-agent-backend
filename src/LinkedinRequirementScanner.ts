import { Page } from 'puppeteer';
import { untilSuccess } from '../lib/utils';

export class LinkedinRequirementScanner {
  // constructor(queryOptions: null) {}
  static getJobPostData() {
    const ul = Array.from(document.body.querySelectorAll<HTMLLIElement>('.show-more-less-html ul li'));

    if (ul.length === 0) {
      return document.body.querySelector<HTMLDivElement>('.show-more-less-html')?.textContent || '';
    }
    return ul
      .filter((el) => el.textContent)
      .map((el) =>
        el.textContent
          ? el.textContent
              .trim()
              .replace(/[,:'"]/g, '')
              .split(' ')
          : []
      );
  }

  static async goToRequirement(page: Page, url: string) {
    await untilSuccess(async () => {
      await page.goto('https://google.com/', { waitUntil: 'load' });
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForSelector('.show-more-less-html', { timeout: 2000 });
    });
  }
}
