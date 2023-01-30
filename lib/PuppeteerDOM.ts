import puppeteer from 'puppeteer';
import { Profile } from './Profile';
import { RequirementsReader } from './RequirementsReader';

export class PuppeteerDOM {
  profile: Profile;
  constructor(profile: Profile) {
    this.profile = profile;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async scrapRequirements(html: string, query: string) {
    const requirementsObj = new RequirementsReader(this.profile);
    const sentences = requirementsObj.getSentences(html, query);

    const isJobValid = requirementsObj.isJobValid(sentences);
    console.log(isJobValid);
    return isJobValid;
  }
  async initPuppeteer(link: string, query: string) {
    console.log(link);
    const browser = await puppeteer.launch({ headless: false, slowMo: 250 });
    const context = await browser.createIncognitoBrowserContext();

    const page = await context.newPage();
    await page.goto(link);

    const html = await page.evaluate(() => {
      return document.documentElement.innerHTML;
    });

    const res = this.scrapRequirements(html, query);
    await this.delay(3000);
    await context.close();
    return res;
  }
}
