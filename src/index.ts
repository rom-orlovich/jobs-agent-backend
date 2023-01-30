import { Profile } from '../lib/Profile';
import { Query } from '../lib/Query';
import { ExperienceRange } from '../lib/types/profile';
import { GenericRecord } from '../lib/types/types';
import { JobsScan } from './JobsScan';

export const REQUIREMENTS: GenericRecord<ExperienceRange> = {
  javascript: { min: 0, max: 3 },
  react: { min: 0, max: 3 },
  typescript: { min: 0, max: 3 },
  ts: { min: 0, max: 3 },
  js: { min: 0, max: 3 },
  'node.js': { min: 0, max: 3 },
  git: { min: 0, max: 3 },
};

export const profile = new Profile({
  overallEx: 2,
  requirementsOptions: REQUIREMENTS,
  excludeTechs: {
    'c#.net': false,
    php: false,
    'c++': false,
    'c#': false,
    java: false,
  },
});

export const queryOptions = new Query({
  sortBy: 'recent',
  period: 'past week',
  jobQuery: 'React',
  distance: '10 mi (15km)',
  location: 'Kiryat Ono',

  // limit: 50,
  blackList: [
    'senior',
    'lead',
    'angular',
    'devops',
    'cloud',
    'wordpress',
    'devops',
    '"Data Analyst',
    'data',
    'ux',
    'ui',
    'Quality Assurance',
    'qa',
    'CSV',
    'php',
  ],
  whiteList: [
    'front-end',
    'frontend',
    'full-stack',
    'fullstack',
    'javascript',
    'react',
    'react.js',
    'node.js',
    'node',
    'js',
    'junior',
    'fe',
    'fw',
  ],
});

const main = async () => {
  const jobScan = new JobsScan(profile, queryOptions);
  await jobScan.scanning();
};

main();
