import { Browser, Page } from 'puppeteer';
import { JobsDB } from '../../../lib/JobsDB';
import { PuppeteerSetup } from '../../../lib/PuppeteerSetup';
import { ExperienceRange } from '../../../lib/types/profile';
import { GenericRecord } from '../../../lib/types/types';
import { UserInput } from '../../GeneralQuery';
import { Profile } from '../../Profile';
import { LinkedinScanner } from '../LinkedinScanner';
import { JOB_POST_EX1_HTML, JOB_POST_EX2_HTML, JOB_POST_EX3_HTML } from './mocks/htmlContext';

describe.skip('Test getAllJobsData.test.ts of linkedin scanner', () => {
  const REQUIREMENTS: GenericRecord<ExperienceRange> = {
    javascript: { min: 0, max: 3 },
    react: { min: 0, max: 3 },
    typescript: { min: 0, max: 3 },
    ts: { min: 0, max: 3 },
    js: { min: 0, max: 3 },
    'node.js': { min: 0, max: 3 },
    git: { min: 0, max: 3 },
    fullstack: { min: 0, max: 3 },
    frontend: { min: 0, max: 3 },
  };

  const profile = new Profile({
    overallEx: 2,
    requirementsOptions: REQUIREMENTS,
    excludeTechs: {
      'c#.net': true,
      php: true,
      c: true,
      'c#': true,
      java: true,
      'system administration': true,
      embedded: true,
      go: true,
      ruby: true,
    },
  });
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
    const res = await evaluateContent(
      page,
      JOB_POST_EX1_HTML,
      linkedinScanner.getAllJobsPostData,
      'linkedin'
    );

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
    const res = await evaluateContent(
      page,
      JOB_POST_EX2_HTML,
      linkedinScanner.getAllJobsPostData,
      'linkedin'
    );

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
    const res = await evaluateContent(
      page,
      JOB_POST_EX3_HTML,
      linkedinScanner.getAllJobsPostData,
      'linkedin'
    );

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
