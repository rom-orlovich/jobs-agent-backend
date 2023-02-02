import { profile, queryOptions } from '../src/index';
import puppeteer, { Page } from 'puppeteer';
import { RequirementsReader } from '../lib/RequirementsReader';
import { CheerioDom } from '../lib/CheerioDom';
import { Job } from '../lib/types/linkedinScrapper';
import { Log, JobsScan } from './JobsScan';
import {} from '../lib/Query';
import { GoogleTranslateQuery } from '../lib/types/google-translate';
import { GenericRecord } from '../lib/types/types';
import { load } from 'cheerio';
import { Scanner, TaskProps } from './Scanner';
import Cluster, { TaskFunction } from 'puppeteer-cluster/dist/Cluster';
import { GoogleTranslateScanner } from './GoogleTransalteScanner';
import { ScanningFS } from '../lib/ScanningFS';

export class GotFriendsScan extends Scanner<GenericRecord<unknown>, TaskProps, Job[]> {
  constructor(queryOptions: GenericRecord<unknown>) {
    super(queryOptions);
  }

  getGoogleTranslateQuery(opt: GoogleTranslateQuery): string {
    const { text, to, op } = opt;
    if (!text) return '';
    const from: string = opt.from || 'auto';
    if (opt.op === 'translate') {
      if (text.length > 5000) return '';
      if (text.length === 0) return '';
    }
    return `?text=${encodeURIComponent(text)}&sl=${from}&tl=${to}&op=${op}`;
  }

  private async initialFilters(page: Page) {
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
  }

  taskCreator(): TaskFunction<TaskProps, Job[]> {
    const task: TaskFunction<TaskProps, Job[]> = async ({ data, page }) => {
      const jobs: Job[] = [];
      this.initialFilters(page);
      let i = 0;
      while (i < 50) {
        const nav = await page.waitForSelector('a.position');
        if (nav) console.log(`page number ${i + 1}`);
        const html = await page.evaluate(() => {
          return document.body.innerHTML;
        });
        const $ = load(html);
        // const cheerio = new CheerioDom(html);
        const posts = $('.panel .item');
        console.log(posts.length);
        for (const post of posts) {
          const postAPI = $(post);
          const text = postAPI.find('.desc').text();
          const postLink = postAPI.find('a.position');
          const title = postLink.text().trim().replace(/\n/, '');
          if (queryOptions.checkWordInBlackList(title)) continue;
          const id = postAPI.find('.career_num').text().split(':')[1].trim();
          const link = 'https://www.gotfriends.co.il' + postLink.attr('href') || '';
          const exist = data.jobs.find((el) => el.jobID === id);
          // const existJob = jobs.find((el) => el.jobID === id);
          // const existLog = logs.find((el) => el.logID === id);
          console.log('title', title);
          if (!exist) continue;
          // const qu = this.getGoogleTranslateQuery({ op: 'translate', to: 'en', text: text });

          // const go = await page.newPage();
          // console.log('go to goggle translate');
          // await go.goto('https://translate.google.com/' + qu);
          // // const el1 = await page.waitForSelector('span>span[data-phrase-index="0"]>span[jsaction]');

          // try {
          //   const el1 = await go.waitForSelector(`span[jsname*='W297wb']`, { timeout: 10000 });
          // } catch (error) {
          //   console.log(error);
          // }

          // const html2 = await go.evaluate(() => {
          //   return document.body.innerHTML;
          // });
          // // const cheerio2 = new CheerioDom(html2);
          // // const el2 = cheerio2.$()
          // //   .toArray(`span[jsname*='W297wb']`)
          // //   .filter((el3) => el3.text().trim())
          // //   .map((el3) => el3.text().split(' '));
          // const $ = load(html2);
          // const el2 = $(`span[jsname*='W297wb'`).text();

          // const isJobValid = RequirementsReader.checkIsRequirementsMatch(el2, profile);
          // await go.close();
          const googleTranslate = new GoogleTranslateScanner({ op: 'translate', to: 'en', text: text });
          const isRequirementsMatch = await data.cluster?.execute(
            { text },
            googleTranslate.taskCreator()
          );
          if (!isRequirementsMatch.pass) continue;
          const location = postAPI.find('.info-data').text().trim();
          const job = { company: '', jobID: id, title: title, link: link, location };
          console.log(job);

          jobs.push(job);

          // else {
          //   const log = { link: link, logID: id, reason: isJobValid.reason, title: title };
          //   logCur.push(log);
          // }
        }
        i++;
        await page.click('#rightLeft a');
      }
      console.log('finish');
      // await ScanningFS.writeData([...data.jobs, ...jobs]);
      return [...data.jobs, ...jobs];
      // await browser.close();
      // return { logCur, jobsCur };
    };
    return task;
  }
}

// const qy = async (jobs: Job[], logs: Log[]) => {
//   // console.log('start');
//   // const browser = await puppeteer.launch({
//   //   headless: true,
//   //   slowMo: 200,
//   //   defaultViewport: null,
//   // });
//   // const page = await browser.newPage();
//   // const jobsCur: Job[] = [];
//   // const logCur: Log[] = [];
//   // await page.setCookie(...cookies);
//   // await page.goto('https://www.gotfriends.co.il/jobs/');
//   // await page.click('#professionAreaTitle');
//   // await page.click(`label[for='radioAreas-1108']`);
//   // await page.click('#professionTitle');
//   // await page.click(`label[for='checkboxProfessions-1970']`);
//   // await page.click(`label[for='checkboxProfessions-1947']`);
//   // await page.click(`label[for='checkboxProfessions-1965']`);
//   // await page.click(`label[for='checkboxProfessions-8010']`);
//   // await page.click('#regionTitle');
//   // await page.click(`li label[for*='checkboxRegions-1']`);
//   // await page.click('#searchButton');

//   let i = 0;
//   while (i < 50) {
//     const nav = await page.waitForSelector('a.position');
//     if (nav) console.log(`page number ${i + 1}`);
//     const html = await page.evaluate(() => {
//       return document.body.innerHTML;
//     });
//     const $ = load(html);
//     // const cheerio = new CheerioDom(html);
//     const elements = $('.panel .item');
//     console.log(elements.length);
//     for (const post of posts) {
//       const postAPI = $(post);
//       const text = postAPI.find('.desc').text();
//       const postLink = postAPI.find('a.position');
//       const title = postLink.text().trim().replace(/\n/, '');
//       if (queryOptions.checkWordInBlackList(title)) continue;
//       const id = postAPI.find('.career_num').text().split(':')[1].trim();
//       const link = 'https://www.gotfriends.co.il' + postLink.attr('href') || '';

//       const existJob = jobs.find((el) => el.jobID === id);
//       const existLog = logs.find((el) => el.logID === id);
//       console.log('title', title);
//       if (!existLog && !existJob) {
//         const qu = getGoogleTranslateQuery({ op: 'translate', to: 'en', text: text });

//         const go = await browser.newPage();
//         console.log('go to goggle translate');
//         await go.goto('https://translate.google.com/' + qu);
//         // const el1 = await page.waitForSelector('span>span[data-phrase-index="0"]>span[jsaction]');

//         try {
//           const el1 = await go.waitForSelector(`span[jsname*='W297wb']`, { timeout: 10000 });
//         } catch (error) {
//           console.log(error);
//         }

//         const html2 = await go.evaluate(() => {
//           return document.body.innerHTML;
//         });
//         // const cheerio2 = new CheerioDom(html2);
//         // const el2 = cheerio2.$()
//         //   .toArray(`span[jsname*='W297wb']`)
//         //   .filter((el3) => el3.text().trim())
//         //   .map((el3) => el3.text().split(' '));
//         const $ = load(html2);
//         const el2 = $(`span[jsname*='W297wb'`).text();

//         const isJobValid = RequirementsReader.checkIsRequirementsMatch(el2, profile);
//         await go.close();
//         if (isJobValid.pass) {
//           const location = el.find('.info-data').text().trim();
//           const job = { company: '', jobID: id, title: title, link: link, location };
//           console.log(job);

//           jobsCur.push(job);
//         }
//         // else {
//         //   const log = { link: link, logID: id, reason: isJobValid.reason, title: title };
//         //   logCur.push(log);
//         // }
//       }
//     }
//     i++;
//     await page.click('#rightLeft a');
//   }
//   await browser.close();
//   return { logCur, jobsCur };
//   // } catch (error) {
//   //   console.log(error);
//   // }
// };
// const scan = new JobsScan(profile, queryOptions);
// (async () => {
//   // const pathJobs = scan._createPathPotentialJobsJSON();
//   // const pathLogs = scan._createPathLogsJobJSON();
//   // const jobs = await scan.loadJSON<Job>(pathJobs);
//   // const logs = await scan.loadJSON<Log>(pathLogs);
//   // const { logCur, jobsCur } = await qy(jobs, logs);
//   // const jobsInsert = [...jobs, ...jobsCur];
//   // const logsInsert = [...logs, ...logCur];
//   // await scan._writeJSON(jobsInsert, pathJobs);
//   // await scan._writeJSON(logsInsert, pathLogs);
// })();

// () => {
//   const inTheList = Array.from(profile.requirements.keys());
//   const notTheList = Array.from(profile.excludeTechs.entries())
//     .filter(([key, value]) => value)
//     .map((el) => el[0]);
//   const eb = createOrRegexOfWords(inTheList);
//   const er = createOrRegexOfWords(notTheList);
//   console.log(eb);
//   const res = getSentencesWithPattern(``, eb, er);
//   console.log(res);
// };
