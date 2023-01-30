import puppeteer from 'puppeteer';
import { Profile } from './Profile';
import { RequirementsReader } from './RequirementsReader';
import { writeFile, appendFile } from 'fs/promises';
import path from 'path';
export class PuppeteerDOM {
  profile: Profile;
  constructor(profile: Profile) {
    this.profile = profile;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createPathJSON() {
    return path.join(__dirname, '../', 'JSON', 'fetch-logs-failure.json');
  }

  private async writeLog(log: { link: string; reason: string }) {
    await appendFile(this.createPathJSON(), JSON.stringify(log), { flag: 'a', encoding: 'utf8' });
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
    const browser = await puppeteer.launch({ headless: true, slowMo: 250 });
    const context = await browser.createIncognitoBrowserContext();

    const page = await context.newPage();
    await page.goto(link);

    const html = await page.evaluate(() => {
      return document.documentElement.innerHTML;
    });

    const res = await this.scrapRequirements(html, query);
    await this.delay(2000);
    await browser.close();
    if (!res.pass) await this.writeLog({ link, reason: res.reason });
    return res.pass;
  }
}
