import { Scanner } from '../scanner';

import { AllJobsQueryOptions } from './allJobQueryOptions';
import { CheerioAPI, load } from 'cheerio';
import { UserEntity } from '../../user/userEntity';
import { JobsDB } from '../../../../lib/jobsDB';
import { JobPost } from '../../jobsScanner';

export class AllJobScanner extends Scanner {
  allJobsQueryOptions: AllJobsQueryOptions;
  constructor(user: UserEntity, JobsDB: JobsDB) {
    super('allJobs', user, JobsDB);
    this.allJobsQueryOptions = new AllJobsQueryOptions(user.userQuery);
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

        return {
          jobID,
          title,
          link,
          company,
          location,
          text,
          from: this.scannerName,
          addedAt: new Date(),
        };
      });
  }

  async get$(page = 0) {
    const html = await this.getAxiosData<string>(page);
    const $ = load(html || '');
    return $;
  }
  async getDataFromHTML(page: number) {
    const $ = await this.get$(page);
    const jobsPosts = (await this.getAllJobsData($)).filter(this.filterJobsPosts);
    const filterJobs = await this.filterJobsExistInDB(jobsPosts, this.allJobsQueryOptions.hash);
    return filterJobs;
  }

  async scanning() {
    const $ = await this.get$(0);
    const maxPages = Number($('#hdnTotalPages').val());
    const promises: Promise<JobPost[]>[] = [];
    let page = 0;

    while (page < maxPages) {
      console.log(`Page number ${page}`);
      promises.push(this.getDataFromHTML(page));
      page++;
    }

    const jobs = await this.getTranslateResultsScanning(promises);

    return jobs;
  }
}

// (async () => {
//   const lin = new AllJobScanner(EXAMPLE_QUERY, profile, new JobsDB());
//   const t = await lin.scanning([]);

//   console.log(t);
//   console.log('finish scanning AllJobs');
// })();
