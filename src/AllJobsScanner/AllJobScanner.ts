import { Scanner } from '../Scanner';

import { Profile } from '../Profile/Profile';

import { AllJobsQueryOptions } from './AllJobQueryOptions';
import { CheerioAPI, load } from 'cheerio';
import { UserInput } from '../GeneralQuery';
import { JobsDB } from '../../lib/JobsDB';
import { Job, JobPost } from '../JobsScanner/jobsScanner';
import { exampleQuery, profile } from '../..';

export class AllJobScanner extends Scanner {
  allJobsQueryOptions: AllJobsQueryOptions;
  constructor(userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super('allJobs', profile);
    this.allJobsQueryOptions = new AllJobsQueryOptions(userInput);
  }
  getURL(page = 1) {
    const { location, distance, position, jobType } = this.allJobsQueryOptions;
    return `https://www.alljobs.co.il/SearchResultsGuest.aspx?type=${jobType}&page=${page}&freetxt=${position}&type=37&source=${location}&duration=${distance}`;
  }

  async getAllJobsData($: CheerioAPI) {
    return $('.job-content-top')
      .toArray()
      .map((el) => {
        const titleEl = $(el).find('.job-content-top a[title]');
        const title = titleEl.find('h3').text();

        const link = `https://www.alljobs.co.il` + titleEl.attr('href') || '';
        const linkSplit = link.split('=');
        const jobID = linkSplit[linkSplit.length - 1];
        const company = $(el).find('.T14 a:first-child').text().trim();

        const location = $(el)
          .find('.job-content-top-location a')
          .toArray()
          .map((el) => $(el).text())
          .join(',');
        const text = $(el).find('.PT15').text().trim();

        return { jobID, title, link, company, location, text, from: this.scannerName };
      });
  }

  async get$(page = 0) {
    const html = await this.getAxiosData<string>(page);
    const $ = load(html || '');
    return $;
  }
  async getDataFromHTML(page: number, preJobs: Job[]) {
    const $ = await this.get$(page);
    const data = (await this.getAllJobsData($)).filter((jobPost) => {
      if (!jobPost.link || !jobPost.jobID || !jobPost.title || !jobPost.text) return false;
      if (this.allJobsQueryOptions.checkWordInBlackList(jobPost.title)) return false;
      if (preJobs.find((el) => el.jobID === jobPost.jobID)) return false;
      return true;
    });
    return data;
  }

  async scanning(preJobs: Job[]) {
    const $ = await this.get$(0);
    const maxPages = Number($('#hdnTotalPages').val());

    const promises: Promise<JobPost[]>[] = [];
    let page = 0;

    while (page < maxPages) {
      console.log(`Page number ${page}`);
      promises.push(this.getDataFromHTML(page, preJobs));
      page++;
    }

    const jobs = await this.getResultScanning(promises);

    return jobs;
  }
}

// (async () => {
//   const lin = new AllJobScanner(exampleQuery, profile, new JobsDB());
//   const t = await lin.scanning([]);

//   console.log(t);
//   console.log('finish scanning AllJobs');
// })();
