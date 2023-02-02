import { profile, queryOptions } from '../src/index';
import puppeteer from 'puppeteer';
import { RequirementsReader } from '../lib/RequirementsReader';
import { CheerioDom } from '../lib/CheerioDom';
import { Job } from '../lib/types/linkedinScrapper';
import { Log, JobsScan } from './JobsScan';
import {} from '../lib/Query';
import { GoogleTranslateQuery } from '../lib/types/google-translate';
import { GenericRecord } from '../lib/types/types';
import { load } from 'cheerio';

class GotFriendsScan {
  queryOptions: GenericRecord<any>;
  constructor(queryOptions: GenericRecord<any>) {
    this.queryOptions = queryOptions;
  }
}

export const bQuery = (opt: GoogleTranslateQuery): string => {
  const { text, to, op } = opt;
  if (!text) return '';
  const from: string = opt.from || 'auto';
  if (opt.op === 'translate') {
    if (text.length > 5000) return '';
    if (text.length === 0) return '';
  }
  return `?text=${encodeURIComponent(text)}&sl=${from}&tl=${to}&op=${op}`;
};

const qy = async (jobs: Job[], logs: Log[]) => {
  console.log('start');
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 200,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  const jobsCur: Job[] = [];
  const logCur: Log[] = [];
  // await page.setCookie(...cookies);
  await page.goto('https://www.gotfriends.co.il/jobs/');
  await page.click('#professionAreaTitle');
  await page.click(`label[for='radioAreas-1108']`);
  await page.click('#professionTitle');
  await page.click(`label[for='checkboxProfessions-1970']`);
  await page.click(`label[for='checkboxProfessions-1947']`);
  await page.click(`label[for='checkboxProfessions-1965']`);
  await page.click(`label[for='checkboxProfessions-8010']`);
  await page.click('#regionTitle');
  await page.click(`li label[for*='checkboxRegions-1']`);
  await page.click('#searchButton');

  let i = 0;
  while (i < 50) {
    const nav = await page.waitForSelector('a.position');
    if (nav) console.log(`page number ${i + 1}`);
    const html = await page.evaluate(() => {
      return document.body.innerHTML;
    });
    const cheerio = new CheerioDom(html);
    const elements = cheerio.toArray('.panel .item');
    console.log(elements.length);
    for (const el of elements) {
      const text = el.find('.desc').text();
      const linkEl = el.find('a.position');
      const title = linkEl.text().trim().replace(/\n/, '');
      if (queryOptions.checkWordInBlackList(title)) continue;
      const id = el.find('.career_num').text().split(':')[1].trim();
      const link = 'https://www.gotfriends.co.il' + linkEl.attr('href') || '';

      const existJob = jobs.find((el) => el.jobID === id);
      const existLog = logs.find((el) => el.logID === id);
      console.log('title', title);
      if (!existLog && !existJob) {
        const qu = bQuery({ op: 'translate', to: 'en', text: text });

        const go = await browser.newPage();
        console.log('go to goggle translate');
        await go.goto('https://translate.google.com/' + qu);
        // const el1 = await page.waitForSelector('span>span[data-phrase-index="0"]>span[jsaction]');

        try {
          const el1 = await go.waitForSelector(`span[jsname*='W297wb']`, { timeout: 10000 });
        } catch (error) {
          console.log(error);
        }

        const html2 = await go.evaluate(() => {
          return document.body.innerHTML;
        });
        // const cheerio2 = new CheerioDom(html2);
        // const el2 = cheerio2.$()
        //   .toArray(`span[jsname*='W297wb']`)
        //   .filter((el3) => el3.text().trim())
        //   .map((el3) => el3.text().split(' '));
        const $ = load(html2);
        const el2 = $(`span[jsname*='W297wb'`).text();

        const isJobValid = RequirementsReader.checkIsRequirementsMatch(el2, profile);
        await go.close();
        if (isJobValid.pass) {
          const location = el.find('.info-data').text().trim();
          const job = { company: '', jobID: id, title: title, link: link, location };
          console.log(job);

          jobsCur.push(job);
        }
        // else {
        //   const log = { link: link, logID: id, reason: isJobValid.reason, title: title };
        //   logCur.push(log);
        // }
      }
    }
    i++;
    await page.click('#rightLeft a');
  }
  await browser.close();
  return { logCur, jobsCur };
  // } catch (error) {
  //   console.log(error);
  // }
};
const scan = new JobsScan(profile, queryOptions);
(async () => {
  const pathJobs = scan._createPathPotentialJobsJSON();
  const pathLogs = scan._createPathLogsJobJSON();
  const jobs = await scan.loadJSON<Job>(pathJobs);
  const logs = await scan.loadJSON<Log>(pathLogs);
  const { logCur, jobsCur } = await qy(jobs, logs);
  const jobsInsert = [...jobs, ...jobsCur];
  const logsInsert = [...logs, ...logCur];
  await scan._writeJSON(jobsInsert, pathJobs);
  await scan._writeJSON(logsInsert, pathLogs);
})();

function getSentencesWithPattern(text: string, pattern: RegExp, noPatterns: RegExp) {
  const sentences = text.split(/[.!?\n]/);

  return sentences
    .filter((sentence) => sentence.match(pattern) && !sentence.match(noPatterns))
    .map((sentence) => sentence.trim().split(' '));
  // .join('\n');
}

const createOrRegexOfWords = (array: string[]) => {
  return new RegExp(`(${array.join('|')})`, 'ig');
};

() => {
  const inTheList = Array.from(profile.requirements.keys());
  const notTheList = Array.from(profile.excludeTechs.entries())
    .filter(([key, value]) => value)
    .map((el) => el[0]);
  const eb = createOrRegexOfWords(inTheList);
  const er = createOrRegexOfWords(notTheList);
  console.log(eb);
  const res = getSentencesWithPattern(``, eb, er);
  console.log(res);
};
