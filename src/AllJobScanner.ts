import { Job } from '../lib/types/linkedinScanner';
import { Scanner } from './Scanner';

import { Profile } from '../lib/Profile';

import { AllJobsQueryOptions } from '../lib/AllJobQueryOptions';
import { CheerioAPI, load } from 'cheerio';

export type JobPost = Job & { text: string };
export class AllJobScanner extends Scanner<AllJobsQueryOptions, any, any> {
  constructor(scannerName: string, queryOptions: AllJobsQueryOptions, profile: Profile) {
    super(scannerName, queryOptions, profile);
  }
  getURL(page = 1) {
    return `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=${page}&position=1712&type=37&source=779&duration=20&exc=&region=`;
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
      if (this.queryOptions.checkWordInBlackList(jobPost.title)) return false;
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
