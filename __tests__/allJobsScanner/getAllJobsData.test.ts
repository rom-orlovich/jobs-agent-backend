import { JOB_POST_EX1_HTML } from './mocks/htmlContext';

import { UserInput } from '../../lib/GeneralQuery';

import { JobsDB } from '../../lib/JobsDB';

import { AllJobScanner, JobPost } from '../../src/AllJobScanner';
import { load } from 'cheerio';
import { profile } from '../..';

describe('Test getAllJobsData.test.ts of allJobs Scanner', () => {
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

  const allJobScanner = new AllJobScanner(exampleQuery, profile, new JobsDB());

  test('Test getAllJobsData of 2 jobs post -ex1', async () => {
    const res = await allJobScanner.getAllJobsData(load(JOB_POST_EX1_HTML));
    const resNormalize = res.map((el) => ({ ...el, text: el.text.replace(/\s+/g, '') }));

    expect(resNormalize).toEqual<JobPost[]>([
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
      },
    ]);
  });
});
