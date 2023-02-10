import { Page } from 'puppeteer';
import throat from 'throat';
import { Profile } from '../lib/Profile';
import { PuppeteerSetup } from '../lib/PuppeteerSetup';
import { RequirementsReader } from '../lib/RequirementsReader';

import { GoogleTranslateQuery } from '../lib/types/google-translate';
import { untilSuccess } from '../lib/utils';
import { JobPost } from './AllJobsScanner/AllJobScanner';

export class GoogleTranslate {
  queryOptions: GoogleTranslateQuery;
  profile: Profile;
  constructor(queryOptions: GoogleTranslateQuery, profile: Profile) {
    this.queryOptions = queryOptions;
    this.profile = profile;
  }
  getURL(text?: string): string {
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
  async goTranslate(page: Page, text?: string): Promise<string> {
    const url = this.getURL(text);

    await untilSuccess(async () => {
      console.log('go to google translate');
      await page.goto(url);
      await page.waitForSelector(`span[jsname*='W297wb']`, { timeout: 20000 });
    });

    const translateText = await page.evaluate<unknown[], () => string>(this.getTranslate);

    return translateText;
  }

  async checkJobRequirements(jobsPosts: JobPost[]) {
    const { browser } = await PuppeteerSetup.lunchInstance({ args: ['--no-sandbox'], headless: true });
    const promises = jobsPosts.map(
      throat(5, async ({ text, ...job }) => {
        const newPage = await browser.newPage();
        const translateText = await this.goTranslate(newPage, text);
        await newPage.close();
        const newJob = {
          ...job,
          reason: RequirementsReader.checkIsRequirementsMatch(translateText, this.profile).reason,
        };
        console.log(newJob);
        return newJob;
      })
    );

    const jobs = await Promise.all(promises);
    await browser.close();
    return jobs;
  }
}
