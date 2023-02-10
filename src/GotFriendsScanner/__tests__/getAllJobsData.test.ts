import { Browser, Page } from 'puppeteer';
import { JobsDB } from '../../../lib/JobsDB';
import { PuppeteerSetup } from '../../../lib/PuppeteerSetup';
import { ExperienceRange } from '../../../lib/types/profile';
import { GenericRecord } from '../../../lib/types/types';
import { JobPost } from '../../AllJobsScanner/AllJobScanner';
import { UserInput } from '../../GeneralQuery';
import { Profile } from '../../Profile';
import { GotFriendsScanner } from '../GotFriendsScanner';
import { JOB_POST_EX1_HTML } from './mocks/htmlContext';

describe('Tests getAllJobsData methods of GotFriendsScanner ', () => {
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
  const gotFriendsScanner = new GotFriendsScanner(exampleQuery, profile, new JobsDB());
  let page: Page, browser: Browser;
  beforeAll(async () => {
    ({ browser, page } = await lunchInstance({}));
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  test('Test getAllJobsData of 2 jobs post -ex1', async () => {
    // await page.goto('https://www.gotfriends.co.il/');
    const res = await evaluateContent(
      page,
      JOB_POST_EX1_HTML,
      gotFriendsScanner.getAllJobsPostData,
      'gotFriends'
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
      },
    ]);
  });
});
