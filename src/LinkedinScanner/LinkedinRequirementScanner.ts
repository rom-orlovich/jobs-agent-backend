import { Page } from 'puppeteer';
import { untilSuccess } from '../../lib/utils';
import { Scanner } from '../Scanner';

export class LinkedinRequirementScanner {
  static getJobPostData() {
    const ul = Array.from(document.body.querySelectorAll<HTMLLIElement>('.show-more-less-html ul li'));

    if (ul.length === 0) {
      return document.body.querySelector<HTMLDivElement>('.show-more-less-html')?.textContent || '';
    }
    return ul
      .filter((el) => el.textContent)
      .map((el) => el.textContent)
      .join(' ');
    // .map((el) =>
    //   el.textContent
    //     ? el.textContent
    //         .toLowerCase()
    //         .split(/,|\/| /g) // split ','| '/' and spaces between words.
    //         .filter((el) => el) // filter empty words.
    //     : []
    // );
  }

  // static async goToRequirement(page: Page, url: string) {
  //   // await untilSuccess(async () => {
  //   //   await page.goto('https://google.com/', { waitUntil: 'load' });
  //   //   await page.goto(url, { waitUntil: 'load' });
  //   //   await page.waitForSelector('.show-more-less-html', { timeout: 3000 });
  //   // });
  //   await Scanner.waitUntilScan(page, url, '.show-more-less-html');
  // }
}
