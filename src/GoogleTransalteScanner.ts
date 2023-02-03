import { load } from 'cheerio';
import { Page } from 'puppeteer';
import { TaskFunction } from 'puppeteer-cluster/dist/Cluster';

import { GoogleTranslateQuery } from '../lib/types/google-translate';
import { Scanner } from './Scanner';

export class GoogleTranslateScanner extends Scanner<GoogleTranslateQuery, { text: string }, string[][]> {
  constructor(queryOptions: GoogleTranslateQuery) {
    super(queryOptions);
  }

  getURL(opt: GoogleTranslateQuery): string {
    const { text, to, op } = opt;
    if (!text) return '';
    const from: string = opt.from || 'auto';
    if (opt.op === 'translate') {
      if (text.length > 5000) return '';
      if (text.length === 0) return '';
    }
    return `https://translate.google.com/?text=${encodeURIComponent(text)}&sl=${from}&tl=${to}&op=${op}`;
  }

  static getTranslate() {
    const spans = Array.from(document.querySelectorAll("span[jsname*='W297wb']"));
    return spans
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
  taskCreator(): TaskFunction<{ text: string }, string[][]> {
    const task: TaskFunction<{ text: string }, string[][]> = async ({ data, page }) => {
      const url = this.getURL({ op: 'translate', to: 'en', text: data.text });

      console.log('go to google translate');
      await page.goto(url);
      // const el1 = await page.waitForSelector('span>span[data-phrase-index="0"]>span[jsaction]');

      try {
        await page.waitForSelector(`span[jsname*='W297wb']`, { timeout: 10000 });
      } catch (error) {
        console.log(error);
        await page.goto(url);
      }

      const translateText = await page.evaluate(GoogleTranslateScanner.getTranslate);

      // const $ = load(html);
      // const translateText = $(`span[jsname*='W297wb']`).text();
      return translateText;
    };

    return task;
  }

  async goTranslatePage(page: Page) {
    const url = this.getURL({ op: 'translate', to: 'en', text: this.queryOptions.text });

    console.log('go to google translate');
    await page.goto(url);
    // const el1 = await page.waitForSelector('span>span[data-phrase-index="0"]>span[jsaction]');

    try {
      await page.waitForSelector(`span[jsname*='W297wb']`, { timeout: 10000 });
    } catch (error) {
      console.log(error);
      await page.goto(url);
    }
  }
}
