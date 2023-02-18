import { GenericRecord } from '../../../../lib/types';
import { UserQuery } from '../../generalQuery/query';
import { User } from '../../user/user';
import { ExperienceRange } from '../../user/userEntity';
import { RequirementsReader } from '../requirementsReader';

describe.skip('Tests simple examples of checkIsRequirementsMatch function', () => {
  // Note: All the keys in the requirementsOptions map and excludeRequirements should be lowercase!
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
    excludeRequirements: {
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

  test('Tests one sentence when the language is found in the excludeRequirements obj ', () => {
    const sentences = [['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });

  test('Tests one sentence when the language included in the excludeRequirements its ok for the position and the years  experience are ok but no other language from my tech stack', () => {
    const EXAMPLE_USER = new User({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': false },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });

    const sentences = [['C#.NET', 'Core', '–', '1+', 'years', 'of', 'experience']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });

  test('Tests one sentence when the language included in the excludeRequirements obj but is ok for the position but the years experience are not', () => {
    const EXAMPLE_USER = new User({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': false },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });

    const sentences = [['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });

  test(`Tests one sentence when the language program years experience is bigger than the EXAMPLE_USER' experience`, () => {
    const sentences = [['javascript', '14+', 'years', 'of', 'experience']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });
  test(`Tests one sentence when the language program before the years experience and the years experience are ok `, () => {
    const sentences = [['javascript', '1+', 'years', 'of', 'experience']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeTruthy();
  });
  test(`Tests one sentence when the language program before the years experience and the years experience are range and they are ok `, () => {
    const sentences = [['javascript', '0-2', 'years', 'of', 'experience']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeTruthy();
  });

  test(`Tests one sentence when the language program before the years experience and the years experience are range and they aren't ok by overall experience `, () => {
    const sentences = [['javascript', '3-5', 'years', 'of', 'experience']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });
  test(`Tests one sentence when the language program before the years experience and the years experience are range and they aren't ok by language experience`, () => {
    const EXAMPLE_USER = new User({
      overallEx: 5,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': false },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });

    const sentences = [['javascript', '4-5', 'years', 'of', 'experience']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });

  test(`Tests one sentence when the language program is after the years experience and the years experience are ok`, () => {
    const sentences = [['1+', 'years', 'of', 'experience', 'in', 'javascript']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeTruthy();
  });

  test(`Tests one sentence when the language program is after the years experience and the years experience are not ok by overall experience`, () => {
    const sentences = [['5+', 'years', 'of', 'experience', 'in', 'javascript']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });

  test(`Tests one sentence when the language program is after the years experience and the years experience are not ok by language experience only`, () => {
    const REQUIREMENTS: GenericRecord<ExperienceRange> = {
      javascript: { min: 0, max: 2 },
      react: { min: 0, max: 3 },
      typescript: { min: 0, max: 3 },
      ts: { min: 0, max: 3 },
      js: { min: 0, max: 3 },
      'node.js': { min: 0, max: 3 },
      git: { min: 0, max: 3 },
    };
    const EXAMPLE_USER = new User({
      overallEx: 6,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': false },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });

    const sentences = [['5+', 'years', 'of', 'experience', 'in', 'javascript']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });

  test(`Tests one sentence when the language program is after the years experience and the years experience are range and the overallEx is lower`, () => {
    const REQUIREMENTS: GenericRecord<ExperienceRange> = {
      javascript: { min: 0, max: 2 },
      react: { min: 0, max: 3 },
      typescript: { min: 0, max: 3 },
      ts: { min: 0, max: 3 },
      js: { min: 0, max: 3 },
      'node.js': { min: 0, max: 3 },
      git: { min: 0, max: 3 },
    };
    const EXAMPLE_USER = new User({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': false },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });

    const sentences = [['3-5', 'years', 'of', 'experience', 'in', 'javascript']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });
  test(`Tests one sentence when the language program is after the years experience and the years experience are range and the overallEx is ok but the language experience is not`, () => {
    const sentences = [['0-2', 'years', 'of', 'experience', 'javascript', 'all']]
      .map((el) => el.join(' '))
      .join(' ');
    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeTruthy();
  });

  test(`Tests one sentence when there are many language programs and the overallEx is not ok`, () => {
    const EXAMPLE_USER = new User({
      overallEx: 1,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': true, angular: true, 'c#': true, java: true, php: true },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });
    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'javascript', 'and', '2', 'years', 'of', 'node.js'],
    ]
      .map((el) => el.join(' '))
      .join(' ');

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });
  test(`Tests one sentence when there are many language programs and the overallEx is ok `, () => {
    const sentences = [
      ['1', 'years', 'of', 'experience', 'javascript', 'and', '1', 'years', 'of', 'node.js'],
    ]
      .map((el) => el.join(' '))
      .join(' ');

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeTruthy();
  });
  test(`Tests one sentence when there are many language programs and the user ex is not ok `, () => {
    const EXAMPLE_USER = new User({
      overallEx: 2,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': true },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });

    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'javascript', 'and', '3', 'years', 'of', 'node.js'],
    ]
      .map((el) => el.join(' '))
      .join(' ');

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });
  test(`Tests one sentence when there are many language programs and one of them is excluded tech`, () => {
    const EXAMPLE_USER = new User({
      overallEx: 15,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': true },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });

    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'C#.NET', 'and', '3', 'years', 'of', 'node.js'],
    ]
      .map((el) => el.join(' '))
      .join(' ');

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeFalsy();
  });
  test(`Tests one sentence when there are many language programs and one of them is excluded tech that its ok`, () => {
    const EXAMPLE_USER = new User({
      overallEx: 15,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': false },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });

    const sentences = [
      ['0-2', 'years', 'of', 'experience', 'C#.NET', 'and', '3', 'years', 'of', 'node.js'],
    ]
      .map((el) => el.join(' '))
      .join(' ');

    expect(RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER).pass).toBeTruthy();
  });
  test('Tests one sentence when there are many language program', () => {
    const EXAMPLE_USER = new User({
      overallEx: 15,
      requirementsOptions: REQUIREMENTS,
      excludeRequirements: { 'c#.net': false },
      _id: '1',
      blackList: [],
      hashQueries: [],
      userQuery: EXAMPLE_QUERY,
    });
    const sentences = [
      [
        '*',
        'Bootstrap,',
        'JAVASCRIPT,',
        'experience',
        'in',
        'the',
        'ReactJS',
        'or',
        'Angular',
        '2',
        'environment',
      ],
    ]
      .map((el) => el.join(' '))
      .join(' ');
    const res = RequirementsReader.checkIsRequirementsMatch(sentences, EXAMPLE_USER);

    expect(res.pass).toBeTruthy();
  });
});
