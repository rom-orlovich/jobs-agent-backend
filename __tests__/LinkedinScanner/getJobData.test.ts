import { Browser, Page } from 'puppeteer';

import { LinkedinScanner } from '../../src/LinkedinScanner';
import { PuppeteerSetup } from '../../lib/PuppeteerSetup';
import { JOB_POST_EX1_HTML, JOB_POST_EX2_HTML, JOB_POST_EX3_HTML } from './mocks/htmlContext';
import { exampleQuery, profile } from '../..';
import { UserInput } from '../../lib/GeneralQuery';
import { Db } from 'mongodb';
import { JobsDB } from '../../lib/JobsDB';

describe.skip('Test getAllJobsData.test.ts', () => {
  const exampleQuery: UserInput = {
    location: 'תל אביב',
    position: 'Full Stack',
    distance: '1', // 10,25,50,75,

    jobType: '1,2,3', // 1 hybrid, 2:home ,3:onsite
    scope: '1,2', // 1 full, 2:part
    experience: '1,2', //without -1 ,between 1-2,
    blackList: [
      'senior',
      'lead',
      'angular',
      'devops',
      'cloud',
      'wordpress',
      'devops',
      'data analyst',
      'data',
      'ux',
      'ui',
      'quality assurance',
      'qa',
      'csv',
      'php',
      'communications',
      'embedded',
      'power supply',
      'java',
      'ruby',
      'go',
      'etl',
      'technical solution',
      'tax',
      'eae',
      'associate embedded systems engineer',
      'ese',
      'system test',
      'Tier 2 Support Agent',
      'Sales Manager',
    ],
  };
  const { lunchInstance, evaluateContent } = PuppeteerSetup;
  const linkedinScanner = new LinkedinScanner(exampleQuery, profile, new JobsDB());
  let page: Page, browser: Browser;
  beforeAll(async () => {
    ({ browser, page } = await lunchInstance({}));
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  test('Test simple get 1 job data-ex1', async () => {
    const res = await evaluateContent(page, JOB_POST_EX1_HTML, linkedinScanner.getAllJobsPostData);

    expect(res).toEqual([
      {
        from: 'linkedin',
        jobID: '3439174366',
        link: 'https://il.linkedin.com/jobs/view/automation-engineer-at-connecteam-3439174366?refId=v4heRwrd8UeGZhs2Nte5ow%3D%3D&trackingId=0Z6Q6FvpWOxro8ofa6TGzw%3D%3D&position=1&pageNum=4&trk=public_jobs_jserp-result_search-card',
        title: 'Automation Engineer',
        company: 'Connecteam',
        location: 'Tel Aviv-Yafo, Tel Aviv District, Israel',
        date: '2022-12-23',
      },
    ]);
  });
  test('Test simple get 1 job data-ex2', async () => {
    const res = await evaluateContent(page, JOB_POST_EX2_HTML, linkedinScanner.getAllJobsPostData);

    expect(res).toEqual([
      {
        from: 'linkedin',
        jobID: '3438485711',
        link: 'https://il.linkedin.com/jobs/view/junior-ios-developer-at-inmanage-3438485711?refId=v4heRwrd8UeGZhs2Nte5ow%3D%3D&trackingId=0h9qLhnGglBzry%2BSs3Sh0g%3D%3D&position=2&pageNum=4&trk=public_jobs_jserp-result_search-card',
        title: 'Junior iOS Developer',
        company: 'inManage',
        location: 'Tel Aviv-Yafo, Tel Aviv District, Israel',
        date: '2022-12-24',
      },
    ]);
  });
  test('Test many jobs data', async () => {
    const res = await evaluateContent(page, JOB_POST_EX3_HTML, linkedinScanner.getAllJobsPostData);

    expect(res).toEqual([
      {
        from: 'linkedin',
        jobID: '3439174366',
        link: 'https://il.linkedin.com/jobs/view/automation-engineer-at-connecteam-3439174366?refId=v4heRwrd8UeGZhs2Nte5ow%3D%3D&trackingId=0Z6Q6FvpWOxro8ofa6TGzw%3D%3D&position=1&pageNum=4&trk=public_jobs_jserp-result_search-card',
        title: 'Automation Engineer',
        company: 'Connecteam',
        location: 'Tel Aviv-Yafo, Tel Aviv District, Israel',
        date: '2022-12-23',
      },
      {
        from: 'linkedin',
        jobID: '3438485711',
        link: 'https://il.linkedin.com/jobs/view/junior-ios-developer-at-inmanage-3438485711?refId=v4heRwrd8UeGZhs2Nte5ow%3D%3D&trackingId=0h9qLhnGglBzry%2BSs3Sh0g%3D%3D&position=2&pageNum=4&trk=public_jobs_jserp-result_search-card',
        title: 'Junior iOS Developer',
        company: 'inManage',
        location: 'Tel Aviv-Yafo, Tel Aviv District, Israel',
        date: '2022-12-24',
      },
    ]);
  });
});
