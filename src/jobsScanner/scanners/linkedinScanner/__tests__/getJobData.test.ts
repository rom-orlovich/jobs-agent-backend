import { Browser, Page } from 'puppeteer';
import { JobsDB } from '../../../../../lib/jobsDB';
import { PuppeteerSetup } from '../../../../../lib/puppeteerSetup';
import { GenericRecord } from '../../../../../lib/types';
import { UserQuery } from '../../../generalQuery/query';
import { User } from '../../../user/user';
import { ExperienceRange } from '../../../user/userEntity';
import { LinkedinScanner } from '../linkedinScanner';
import { JOB_POST_EX1_HTML, JOB_POST_EX2_HTML, JOB_POST_EX3_HTML } from './mocks/htmlContext';

describe('Tests getAllJobsData method of LinkedinScanner', () => {
  const REQUIREMENTS = {
    javascript: { min: 0, max: 3 },
    react: { min: 0, max: 3 },
    reactjs: { min: 0, max: 3 },
    typescript: { min: 0, max: 3 },
    ts: { min: 0, max: 3 },
    js: { min: 0, max: 3 },
    node: { min: 0, max: 2 },
    nextjs: { min: 0, max: 3 },
    git: { min: 0, max: 3 },
    github: { min: 0, max: 3 },
    html: { min: 0, max: 3 },
    css: { min: 0, max: 3 },
    scss: { min: 0, max: 3 },
    tailwinds: { min: 0, max: 3 },
    mui: { min: 0, max: 3 },
    express: { min: 0, max: 3 },
    fullstack: { min: 0, max: 3 },
    frontend: { min: 0, max: 3 },
    sql: { min: 0, max: 3 },
    python: { min: 0, max: 2 },
    mongo: { min: 0, max: 3 },
    nosql: { min: 0, max: 3 },
    noSQL: { min: 0, max: 3 },
  };

  const EXAMPLE_QUERY: UserQuery = {
    location: 'תל אביב',
    position: 'Frontend',
    distance: '1', // 10,25,50,75,
    jobType: '1,2,3', // 1 hybrid, 2:home ,3:onsite
    scope: '1,2', // 1 full, 2:part
    experience: '1,2', //without -1 ,between 1-2,
    active: true,
  };

  const EXAMPLE_USER = new User({
    overallEx: 2,
    requirementsOptions: REQUIREMENTS,
    excludedRequirements: {
      'c#.net': true,
      php: true,
      c: true,
      'c#': true,
      java: true,
      'system administration': true,
      embedded: true,
      go: true,
      ruby: true,
      angular: true,
      net: true,
      qa: true,
    },
    blackList: [
      // 'senior',
      // 'lead',
      // 'angular',
      // 'devops',
      // 'cloud',
      // 'wordpress',
      // 'devops',
      // 'data analyst',
      // 'data',
      // 'ux',
      // 'ui',
      // 'quality assurance',
      // 'qa',
      // 'csv',
      // 'php',
      // 'communications',
      // 'embedded',
      // 'power supply',
      // 'java',
      // 'ruby',
      // 'go',
      // 'etl',
      // 'technical solution',
      // 'tax',
      // 'eae',
      // 'associate embedded systems engineer',
      // 'ese',
      // 'system test',
      // 'Tier 2 Support Agent',
      // 'Sales Manager',
    ],
    _id: '1',
    hashQueries: [],
    userQuery: EXAMPLE_QUERY,
  });
  const { lunchInstance, evaluateContent } = PuppeteerSetup;
  const linkedinScanner = new LinkedinScanner(EXAMPLE_USER, new JobsDB());
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
      'linkedin',
      new Date()
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
      'linkedin',
      new Date()
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
      'linkedin',
      new Date()
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
