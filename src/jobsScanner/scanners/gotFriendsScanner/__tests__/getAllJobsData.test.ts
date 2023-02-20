import { Browser, Page } from 'puppeteer';
import { JobsDB } from '../../../../../lib/jobsDB';
import { PuppeteerSetup } from '../../../../../lib/puppeteerSetup';
import { UserQuery } from '../../../generalQuery/query';
import { JobPost } from '../../../jobsScanner';
import { User } from '../../../user/user';

import { GotFriendsScanner } from '../gotFriendsScanner';
import { JOB_POST_EX1_HTML } from './mocks/htmlContext';

describe('Tests getAllJobsData methods of GotFriendsScanner ', () => {
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
  const gotFriendsScanner = new GotFriendsScanner(EXAMPLE_USER, new JobsDB());
  let page: Page, browser: Browser;
  beforeAll(async () => {
    ({ browser, page } = await lunchInstance({}));
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  test('Test getAllJobsData of 2 jobs post -ex1', async () => {
    const res = await evaluateContent(
      page,
      JOB_POST_EX1_HTML,
      gotFriendsScanner.getAllJobsPostData,
      'gotFriends',
      new Date()
    );
    const resNormalize = res.map((el) => ({ ...el, text: el.text.replace(/\s+/g, '') }));

    expect(resNormalize).toEqual<JobPost[]>([
      {
        title: 'Principal Engineer בחברה מצליחה ומרשימה!',
        company: '',
        from: 'gotFriends',
        jobID: '141860',
        location: 'ת"א והמרכז',
        text: `דרישות המשרה:
        -10 שנות ניסיון בפיתוח Backend
        -4 שנות ניסיון ב- Python
        -ניסיון על פלטפורמות Cloud ו- SaaS
        -ניסיון ב- Linux`.replace(/\s+/g, ''),
        link: 'https://www.gotfriends.co.il/jobslobby/software/head-of-development-team/141860/',
        createdAt: new Date(),
      },
      {
        title: 'Software Developer (C) בחברת יוניקורן',
        company: '',
        from: 'gotFriends',
        jobID: '141502',
        location: 'ת"א והמרכז',
        text: `דרישות המשרה:
        - 4 שנות ניסיון בפיתוח C++/C
        - 4 שנות ניסיון בפיתוח BASH
        - ניסיון ב-Networking בפרוטוקולי תקשורת 2L
        - ניסיון ב-Linux/Unix/FreeBSD
        - ניסיון עם Command Line Tools`.replace(/\s+/g, ''),
        link: 'https://www.gotfriends.co.il/jobslobby/software/cplusplus-programmer/141502/',
        createdAt: new Date(),
      },
    ]);
  });
});
