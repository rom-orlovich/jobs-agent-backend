import { Page, EvaluateFunc } from 'puppeteer';

import { GoogleTranslateQuery } from '../lib/types/google-translate';
import { Scanner } from './Scanner';

export class GoogleTranslateScanner extends Scanner<GoogleTranslateQuery, { text: string }, string> {
  constructor(queryOptions: GoogleTranslateQuery) {
    super(queryOptions);
    this.queryOptions = queryOptions;
  }
  getURL(): string {
    const { text, to, op } = this.queryOptions;
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

  async goTranslate(page: Page): Promise<string> {
    const url = this.getURL();

    console.log('go to google translate');
    await page.goto(url);

    try {
      await page.waitForSelector(`span[jsname*='W297wb']`, { timeout: 10000 });
    } catch (error) {
      console.log(error);
      await page.goto(url);
    }

    return await page.evaluate<unknown[], () => string>(this.getTranslate());
  }
}
