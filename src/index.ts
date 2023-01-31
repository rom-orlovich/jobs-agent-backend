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
    'c#.net': true,
    php: true,
    'c++': true,
    'c#': true,
    java: true,
    'system administration': true,
    embedded: true,
    go: true,
    ruby: true,
  },
});

export const queryOptions = new Query({
  sortBy: 'recent',
  period: 'past month',
  jobQuery: 'javascript',
  distance: '10 mi (15km)',
  location: 'Tel Aviv',

  // limit: 50,
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
    'web',
    'software',
  ],
});

const main = async () => {
  const jobScan = new JobsScan(profile, queryOptions);
  await jobScan.scanning();
};

main();
