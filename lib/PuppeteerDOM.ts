import puppeteer from 'puppeteer';
import { Profile } from './Profile';
import { RequirementsReader } from './RequirementsReader';

export class PuppeteerDOM {
  profile: Profile;
  constructor(profile: Profile) {
    this.profile = profile;
  }
  async scrapRequirements(html: string) {
    // const domApi = new CheerioDom(html);

    // const elements = domApi.toArray('.show-more-less-html--more ul *');

    // const sentences = splitSentence(elements);

    // console.log(sentences);
    const requirementsObj = new RequirementsReader(this.profile);
    const sentences = requirementsObj.getSentences(html, '.show-more-less-html--more ul *');

    console.log(requirementsObj.isJobValid(sentences));
  }
  async initPuppeteer(link: string) {
    const browser = await puppeteer.launch({ headless: false, slowMo: 250 });
    const context = await browser.createIncognitoBrowserContext();

    const page = await context.newPage();

    const html = await page.evaluate(() => {
      return document.documentElement.innerHTML;
    });

    this.scrapRequirements(html);

    await browser.close();
  }
}
