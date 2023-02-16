import puppeteer, { Page, PuppeteerLaunchOptions } from 'puppeteer';
import { AnyFun } from './types';

export class PuppeteerSetup {
  static async noImageRequest(page: Page) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image') {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  static async lunchInstance(options: PuppeteerLaunchOptions) {
    const browser = await puppeteer.launch({
      headless: true,
      // args: ['--no-snadbox']
      ...options,
    });

    const page = await browser.newPage();
    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; ++i) console.log(`${i}: ${msg.args()[i]}`);
    });
    await PuppeteerSetup.noImageRequest(page);
    return { page, browser };
  }

  static async evaluateContent<T, CB extends (...args: any[]) => T, Args extends Parameters<CB>>(
    page: Page,
    html: string,
    cb: CB,
    ...args: Args
  ) {
    await page.setContent(html);

    return await page.evaluate(cb, ...args);
  }
}
