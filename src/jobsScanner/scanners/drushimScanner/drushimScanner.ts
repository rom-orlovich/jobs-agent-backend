import { DrushimQueryOptions } from './drushimQueryOptions';

import { Scanner } from '../scanner';

import { JobsDB } from '../../../../mongoDB/jobsDB/jobsDB';
import { UserEntity } from '../../user/userEntity.types';
import { DrushimAPI, DrushimResult } from './drushim.types';
import { Job } from '../../../../mongoDB/jobsDB/jobsDB.types';

export class DrushimScanner extends Scanner {
  drushimQueryOptions: DrushimQueryOptions;
  constructor(user: UserEntity, JobsDB: JobsDB) {
    super('drushim', user, JobsDB);
    this.drushimQueryOptions = new DrushimQueryOptions(user.getLastQuery());
  }
  getURL(page: number): string {
    const { experience, scope, location, distance, position } = this.drushimQueryOptions;

    return `https://www.drushim.co.il/api/jobs/search?experience=${experience}&scope=${scope}&area=1&searchterm=${position}&geolexid=${location}&range=${distance}&ssaen=1&page=${page}&isAA=true`;
  }

  getJobsData(results: DrushimResult[] | undefined): Job[] {
    if (!results) return [];
    return results.map((result) => ({
      jobID: String(result.Code),
      company: result.Company.CompanyDisplayName,
      link: 'https://www.drushim.co.il' + result.JobInfo.Link,
      location: result.JobContent.Addresses.map((el) => el.CityEnglish).join(','),
      title: result.JobContent.FullName,
      date: result.JobInfo.Date,
      from: this.scannerName,
      text: result.JobContent.Requirements,
      createdAt: new Date(),
    }));
  }

  async getFilterData(data: DrushimAPI | undefined) {
    const jobs = this.getJobsData(data?.ResultList).filter(this.filterJobs);
    const filterJobs = await this.filterJobsExistInDB(jobs, this.drushimQueryOptions.userQuery.hash);
    return filterJobs;
  }

  async getNormalizeData(page: number) {
    const data = await this.getAxiosData<DrushimAPI>(page);
    return this.getFilterData(data);
  }

  async scanning(): Promise<Job[]> {
    const data = await this.getAxiosData<DrushimAPI>(0);

    if (!data) return [];
    let page = 1;
    const promises: Promise<Job[]>[] = [this.getFilterData(data)];
    while (page < (data?.TotalPagesNumber || 0)) {
      console.log(`Page number ${page}`);
      promises.push(this.getNormalizeData(page));
      page++;
    }

    const jobs = await this.getTranslateResultsScanning(promises);
    return jobs;
  }
}

// (async () => {
//   const drushim = new DrushimScanner(EXAMPLE_QUERY, profile, new JobsDB());
//   const t = await drushim.scanning();

//   console.log('Finish scanning drushim');
//   // console.log(t);
// })();
