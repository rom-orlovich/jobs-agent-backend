import { Page } from 'puppeteer';
import { Profile } from '../lib/Profile';

import { GoogleTranslateQuery } from '../lib/types/google-translate';
import { untilSuccess } from '../lib/Utils';
import { Scanner } from './Scanner';

export class GoogleTranslateScanner extends Scanner<GoogleTranslateQuery, { text: string }, string> {
  constructor(queryOptions: GoogleTranslateQuery, profile: Profile) {
    super(queryOptions, profile);
  }
  getURL(pageNum?: number, text?: string): string {
    const { to, op } = this.queryOptions;
    if (!text) return '';
    const from: string = this.queryOptions.from || 'auto';
    if (op === 'translate') {
      if (text.length > 5000) return '';
      if (text.length === 0) return '';
    }
    return `https://translate.google.com/?text=${encodeURIComponent(text)}&sl=${from}&tl=${to}&op=${op}`;
  }

  getTranslate() {
    const spans = Array.from(document.querySelectorAll("span[jsname*='W297wb']"));
    return spans
      .filter((el) => el.textContent)
      .map((el) => el.textContent?.trim())
      .join('');
  }
  // taskCreator(): TaskFunction<{ text: string }, string> {
  //   const task: TaskFunction<{ text: string }, string> = async ({ data, page }) => {
  //     const url = this.getURL({ op: 'translate', to: 'en', text: data.text });

  //     console.log('go to google translate');
  //     await page.goto(url);

  //     try {
  //       await page.waitForSelector(`span[jsname*='W297wb']`, { timeout: 10000 });
  //     } catch (error) {
  //       console.log(error);
  //       await page.goto(url);
  //     }

  //     const translateText = await page.evaluate(GoogleTranslateScanner.getTranslate);

  //     return translateText;
  //   };

  //   return task;
  // }

  async goTranslate(page: Page, text?: string): Promise<string> {
    const url = this.getURL(undefined, text);

    await untilSuccess(async () => {
      console.log('go to google translate');
      await page.goto(url);
      await page.waitForSelector(`span[jsname*='W297wb']`, { timeout: 10000 });
    });

    const translateText = await page.evaluate<unknown[], () => string>(this.getTranslate);
    console.log(translateText);
    return translateText;
  }
}
