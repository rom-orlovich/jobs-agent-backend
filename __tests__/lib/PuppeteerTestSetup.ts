import puppeteer, { Browser, Page } from 'puppeteer';
import { AnyFun } from '../../lib/types/types';

export class PuppeteerTestSetup {
  static async lunchInstance() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-snadbox'] });
    const page = await browser.newPage();
    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; ++i) console.log(`${i}: ${msg.args()[i]}`);
    });
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
