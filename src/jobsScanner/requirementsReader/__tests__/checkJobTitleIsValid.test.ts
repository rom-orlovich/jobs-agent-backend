import { UserQuery } from '../../generalQuery/query.types';
import { User } from '../../user/user';
import { RequirementsReader } from '../requirementsReader';

describe.only('Tests checkJobTitleIsValid', () => {
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
      lead: true,
    },

    _id: '1',
    hashQueries: [],
    userQuery: EXAMPLE_QUERY,
  });
  test('Test valid title-ex1', () => {
    const title = 'Full stack developer';
    const reason = RequirementsReader.checkJobTitleIsValid(title, EXAMPLE_USER);

    expect(reason).toBe('');
  });
  test('Test invalid title-ex2', () => {
    const title = 'qa stack developer';
    const reason = RequirementsReader.checkJobTitleIsValid(title, EXAMPLE_USER);

    expect(reason).toBe(`The title contains the word 'qa'`);
  });
  test('Test invalid title-ex3', () => {
    const title = '';
    const reason = RequirementsReader.checkJobTitleIsValid(title, EXAMPLE_USER);

    expect(reason).toBe('The title is empty');
  });
  test('Test invalid title-ex4', () => {
    const title = 'Embedded Software Technical Lead';
    const reason = RequirementsReader.checkJobTitleIsValid(title, EXAMPLE_USER);

    expect(reason).toBe(`The title contains the word 'embedded'`);
  });
  test('Test invalid title-ex5', () => {
    const title = 'Software Technical Lead';
    const reason = RequirementsReader.checkJobTitleIsValid(title, EXAMPLE_USER);

    expect(reason).toBe(`The title contains the word 'lead'`);
  });
});
