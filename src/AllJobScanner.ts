import { Job } from '../lib/types/linkedinScanner';
import { Scanner } from './Scanner';

import { Profile } from '../lib/Profile';

import { AllJobsQueryOptions } from '../lib/AllJobQueryOptions';
import { CheerioAPI, load } from 'cheerio';
import { UserInput } from '../lib/GeneralQuery';
import { JobsDB } from '../lib/JobsDB';

export type JobPost = Job & { text: string };
export class AllJobScanner extends Scanner {
  allJobsQueryOptions: AllJobsQueryOptions;
  constructor(userInput: UserInput, profile: Profile, JobsDB: JobsDB) {
    super('allJobs', userInput, profile);
    this.allJobsQueryOptions = new AllJobsQueryOptions(userInput);
  }
  getURL(page = 1) {
    //freetxt
    const { location, distance, scope, position, jobType } = this.allJobsQueryOptions;
    return `https://www.alljobs.co.il/SearchResultsGuest.aspx?type=${jobType}page=${page}&freetxt=${position}&type=37&source=${location}&duration=${distance}&exc=&region=`;
  }

  async getJobPostsData($: CheerioAPI) {
    return $('.job-content-top')
      .toArray()
      .map((el) => {
        const titleEl = $(el).find('.job-content-top a[title]');
        const title = titleEl.text().trim();
        const link = `https://www.alljobs.co.il` + titleEl.attr('href') || '';
        const linkSplit = link.split('=');
        const jobID = linkSplit[linkSplit.length - 1];
        const company = $(el).find('.T14 a').text().trim();
        const location = $(el).find('.job-content-top-location a').text().trim();
        const text = $(el).find('.job-content-top-desc').text().trim();
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
    const data = (await this.getJobPostsData($)).filter((jobPost) => {
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
//   const lin = new AllJobScanner('allJobs', queryOptions, profile);
//   const t = await lin.scanning([]);
// })();
