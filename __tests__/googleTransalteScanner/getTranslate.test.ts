import { Browser, Page } from 'puppeteer';
import { GoogleTranslateScanner } from '../../src/GoogleTranslateScanner';

import { PuppeteerTestSetup } from '../lib/PuppeteerTestSetup';
import { JOB_POST_EX1_HTML, JOB_POST_EX2_HTML } from './mocks/htmlContext';
// import { J } from './mocks/htmlContext';

describe.only('Test getAllJobsData.test.ts', () => {
  const { lunchInstance, evaluateContent } = PuppeteerTestSetup;
  const { getTranslate, goTranslatePage } = GoogleTranslateScanner;
  let page: Page, browser: Browser;
  beforeAll(async () => {
    ({ browser, page } = await lunchInstance());
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  test('Test get the translate test result from html content-ex1.', async () => {
    const res = await evaluateContent(page, JOB_POST_EX1_HTML, getTranslate);

    expect(res.replace(/\s+/g, '')).toBe(
      `A startup company in the field of technology for the retail world needs a Full-Stack Developer.
      The company is developing a system for business intelligence-based management of modern retail chains, an excellent opportunity to work in a team on new developments!
      Requirements:
      - Two years of experience as a Full Stack
      - RestAPI
      - Html5/js/css
      - Java/Python/C#
      - GO advantage
      - Micro services is an advantage
      - Docker/k8 - advantage The job is intended for both women and men.`.replace(/\s+/g, '')
    );
  });
  test('Test get the translate test result from html content-ex2.', async () => {
    const res = await evaluateContent(page, JOB_POST_EX2_HTML, getTranslate);

    expect(res.replace(/\s+/g, '')).toBe(
      `
      A startup in the field of AI developing a system that protects online transactions from money laundering needs a Full Stack Developer!
      Requirements:
      * Bachelor's degree (computer science or equivalent)
      * At least two years of experience in backend development in Java
      * At least two years of experience in front-end development in Angular
      * Experience with Spring Boot, Maven.
      * Experience with SQL
      * high level English
      
      advantage:
      * Experience with AWS + AWS Lambada
      * Experience with NoSQL
      * Experience with Docker/Kubernetes
      * Experience with Python The position is intended for both women and men.
      `.replace(/\s+/g, '')
    );
  });
});
