import { Browser, Page } from 'puppeteer';
import { PuppeteerSetup } from '../../../lib/PuppeteerSetup';
import { ExperienceRange } from '../../../lib/types/profile';
import { GenericRecord } from '../../../lib/types/types';
import { Profile } from '../../Profile';
import { GoogleTranslate } from '../GoogleTranslateScanner';

import { TRANSLATE_EX1_HTML, TRANSLATE_EX2_HTML, TRANSLATE_EX3_HTML } from './mocks/htmlContext';
// import { J } from './mocks/htmlContext';

describe('Test getAllJobsData.test.ts', () => {
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
  const { lunchInstance, evaluateContent } = PuppeteerSetup;
  const googleTranslate = new GoogleTranslate({ op: 'translate', to: 'en', from: 'he' }, profile);
  let page: Page, browser: Browser;
  beforeAll(async () => {
    ({ browser, page } = await lunchInstance({}));
  });

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  test('Test get the translate test result from html content-ex1.', async () => {
    const res = await evaluateContent(page, TRANSLATE_EX1_HTML, googleTranslate.getTranslate);

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
    const res = await evaluateContent(page, TRANSLATE_EX2_HTML, googleTranslate.getTranslate);

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
  test('Test get the translate test result from html content-ex3.', async () => {
    const res = await evaluateContent(page, TRANSLATE_EX3_HTML, googleTranslate.getTranslate);

    expect(res.replace(/\s+/g, '')).toBe(
      `
      Were looking for a Full Stack developer to join our development team and be responsible for building a SaaS back-office platform that will integrate with our core technology and systems.
      If youre interested in creating a user-friendly platform by writing clean code and moving forward in your career, then this job is for you. We expect you to be a tech-savvy professional, who is curious about new digital technologies and aspires to combine usability with visual design.
      The role will allow getting in on the ground floor, laying down the foundations of the technology, and being a vital member of the team that constantly grows.
      Requirements:
      The role requires creativity, a can-do approach, and knowledge and experience in multiple platforms and technologies:
      Proficient understanding of web foundations: HTML, CSS, JavaScript, HTTP, web browsers
      Proficiency with front-end technologies and frameworks, such as React, Vue.js, Webpack
      Proficiency with Node.js and back-end technologies and frameworks, such as NestJS, Express (AdonisJS advantage)
      Experience with TypeScript
      Experience with SQL, MongoDB, and other relational and non-relational databases
      Good understanding of design patterns
      Good understanding of source code management tools, such as Git
      Experience working with GNU/Linux and the command line
      Experience with AWS (advantage)
      Experience with CI/CD pipelines (advantage)
      Experience writing automated tests (advantage).
      המשרה מיועדת לנשים ולגברים כאחד.
      `.replace(/\s+/g, '')
    );
  });
});
