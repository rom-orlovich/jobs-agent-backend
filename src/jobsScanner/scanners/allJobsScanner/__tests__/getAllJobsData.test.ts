import { load } from 'cheerio';
import { JobsDB } from '../../../../../mongoDB/jobsDB/jobsDB';
import { Job } from '../../../../../mongoDB/jobsDB/jobsDB.types';
import { UserQueryProps } from '../../../generalQuery/query.types';

import { User } from '../../../user/user';

import { AllJobScanner } from '../allJobScanner';
import { JOB_POST_EX1_HTML } from './mocks/htmlContext';
// Todo: these tests may not pass. I have to check them again.
describe.skip('Tests getAllJobsData method of AllJobScanner', () => {
  // Note: All the keys in the requirements map and excludedRequirements should be lowercase!
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

  const EXAMPLE_QUERY: UserQueryProps = {
    location: 'תל אביב',
    position: 'Frontend',
    distance: '1', // 10,25,50,75,
    jobType: '1,2,3', // 1 hybrid, 2:home ,3:onsite
    scope: '1,2', // 1 full, 2:part
    experience: '1,2', //without -1 ,between 1-2,
    hash: '',
  };

  const EXAMPLE_USER = new User({
    overallEx: 2,
    requirements: REQUIREMENTS,
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

    userID: '',

    userQueries: [EXAMPLE_QUERY],
  });

  const allJobScanner = new AllJobScanner(EXAMPLE_USER, new JobsDB());

  test('Test getAllJobsData of 2 jobs post -ex1', async () => {
    const res = await allJobScanner.getAllJobsData(load(JOB_POST_EX1_HTML));
    const resNormalize = res.map((el) => ({ ...el, text: el.text.replace(/\s+/g, '') }));

    expect(resNormalize).toEqual<Job[]>([
      {
        title: 'מתכנת /ת לצוות פיתוח WEB',
        company: 'KPMG - סומך חייקין רואי חשבון',
        from: 'allJobs',
        jobID: '6503092',
        location: 'תל אביב יפו',
        text: `דרישות:
        תואר ראשון בהנדסת תוכנה /מערכות מידע - חובה.
        לפחות 2 שנות ניסיון בפיתוח Full Stack בסביבת NET.
        לפחות 2 שנות ניסיון עם C#,.Net, MVC.
        ידע בבניית ממשקים WEB API.
        לפחות 2 שנות ניסיון בMSSQL ברמה מורכבת.
        ניסיון של 2 שנים לפחות בהובלה - עבודה עם Agile/Scrum - יתרון
        ניסיון בפיתוח Client - JavaScript - חובה
        JQUERY, HTML5, CSS3, Telerik.
        רקע באבטחת מידע - יתרון
        
        המשרה מיועדת לאנשים /נשים עם מוגבלויות. המשרה מיועדת לנשים ולגברים כאחד.`.replace(/\s+/g, ''),
        link: 'https://www.alljobs.co.il/Search/UploadSingle.aspx?JobID=6503092',
        createdAt: new Date(),
      },
      {
        title: 'מפתח /ת Full Stack',
        company: 'מלם תים',
        from: 'allJobs',
        jobID: '6908630',
        location: 'פתח תקווה',
        text: `דרישות:
        - ניסיון של שנתיים לפחות בפיתוח Net.
        - ניסיון של שנתיים לפחות בפיתוח Angular
        - עבודה מול תהליכי ETL
        - ניסיון ב- WebApi, Restful services המשרה מיועדת לנשים ולגברים כאחד.`.replace(/\s+/g, ''),
        link: 'https://www.alljobs.co.il/Search/UploadSingle.aspx?JobID=6908630',
        createdAt: new Date(),
      },
    ]);
  });
});
