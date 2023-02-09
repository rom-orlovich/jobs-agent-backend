import { config } from 'dotenv';

config();

import { Profile } from './lib/Profile';
import { LinkedinQueryOptions } from './lib/LinkedinQueryOptions';
import { ExperienceRange } from './lib/types/profile';
import { GenericRecord } from './lib/types/types';
import { JobsScan } from './src/JobsScan';

import { MongoDBClient } from './lib/MongoClient';
import { GotFriendQueryOptions } from './lib/GotFriendsQuery';
import { AllJobsQueryOptions } from './lib/AllJobQueryOptions';
import { DrushimQueryOptions } from './lib/DrushimQueryOptions';
import { UserInput } from './lib/GeneralQuery';
export const REQUIREMENTS: GenericRecord<ExperienceRange> = {
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

export const profile = new Profile({
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

// export const queryOptions = new LinkedinQueryOptions({
//   sortBy: 'recent',
//   period: 'past week',
//   jobQuery: 'front end',
//   distance: '10 mi (15km)',
//   location: 'Tel-Aviv',

//   blackList: [
//     'senior',
//     'lead',
//     'angular',
//     'devops',
//     'cloud',
//     'wordpress',
//     'devops',
//     'data analyst',
//     'data',
//     'ux',
//     'ui',
//     'quality assurance',
//     'qa',
//     'csv',
//     'php',
//     'communications',
//     'embedded',
//     'power supply',
//     'java',
//     'ruby',
//     'go',
//     'etl',
//     'technical solution',
//     'tax',
//     'eae',
//     'associate embedded systems engineer',
//     'ese',
//     'system test',
//     ' Tier 2 Support Agent',
//     'Sales Manager',
//   ],
//   whiteList: [
//     'front-end',
//     'frontend',
//     'full-stack',
//     'fullstack',
//     'javascript',
//     'react',
//     'react.js',
//     'node.js',
//     'node',
//     'js',
//     'junior',
//     'fe',
//     'fw',
//     'web',
//     'software',
//   ],
// });
const exampleQuery: UserInput = {
  location: 'תל אביב',
  position: 'full stack',
  distance: '2', // 10,25,50,75,

  jobType: '1', // 1 hybrid, 2:home ,3:onsite
  scope: '1,2', // 1 full, 2:part
  experience: '1,2', //without -1 ,between 1-2,
  blackList: [],
};
export const mongoDB = new MongoDBClient();
export const jobs = mongoDB.createDBcollection('jobDB', 'jobs');

const main = async () => {
  try {
    // await mongoDB.connect();
    const jobScan = new JobsScan(profile, exampleQuery);

    await jobScan.scanning();
  } catch (error) {
    console.log(error);
    // await mongoDB.close();
  }
};

main();
