import { UserQuery } from '../src/jobsScanner/generalQuery/query.types';
import { User } from '../src/jobsScanner/user/user';

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

export const EXAMPLE_QUERY: UserQuery = {
  location: 'תל אביב',
  position: 'Frontend',
  distance: '1', // 10,25,50,75,
  jobType: '1,2,3', // 1 hybrid, 2:home ,3:onsite
  scope: '1,2', // 1 full, 2:part
  experience: '1,2', //without -1 ,between 1-2,
  active: true,
};

export const EXAMPLE_USER = new User({
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

  _id: '1',
  hashQueries: [],
  userQuery: EXAMPLE_QUERY,
});
