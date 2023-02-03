import { Page } from 'puppeteer';

import { Scanner, TaskProps } from './Scanner';

export class LinkedinRequirementScanner extends Scanner<
  null,
  TaskProps & { URL: string },
  string | undefined
> {
  constructor(queryOptions: null) {
    super(queryOptions);
  }
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

  async goToRequirement(page: Page, url: string) {
    await page.goto(url, { waitUntil: 'load' });

    try {
      await page.waitForSelector('.show-more-less-html', { timeout: 3000 });
    } catch (error) {
      await page.goto('https://google.com/', { waitUntil: 'load' });
      await page.goto(url, { waitUntil: 'load' });
    }
  }
}
