import puppeteer from 'puppeteer';
import { Profile } from './Profile';
import { RequirementsReader } from './RequirementsReader';

export class PuppeteerCluster {
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async init(link: string, query: string) {
    console.log(link);
    const browser = await puppeteer.launch({ headless: true, slowMo: 250 });
    const context = await browser.createIncognitoBrowserContext();

    const page = await context.newPage();
    await page.goto(link);

    const html = await page.evaluate(() => {
      return document.documentElement.innerHTML;
    });

    // const requirementsReader = new RequirementsReader();
    // const res = await requirementsReader.scrapRequirements(html, query);
    await this.delay(1000);
    await browser.close();

    return { reason: '', pass: true };
  }
}
