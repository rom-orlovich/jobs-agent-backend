import Express, { response } from 'express';

import { JobsDB } from '../../lib/JobsDB';
import { MongoDBClient } from '../../lib/MongoClient';

import { JobsScanner } from '../jobsScanner/JobsScanner';
import { UserQuery } from '../jobsScanner/generalQuery/generalQuery';
import { User } from '../jobsScanner/user/user';
const app = Express();
const PORT = 5000;

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

export const profile = new User({
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
});

export const mongoDB = new MongoDBClient();

export const exampleQuery: UserQuery = {
  location: 'תל אביב',
  position: 'full stack',
  distance: '1', // 10,25,50,75,
  jobType: '1,2,3', // 1 hybrid, 2:home ,3:onsite
  scope: '1,2', // 1 full, 2:part
  experience: '1,2', //without -1 ,between 1-2,
};

app.get('/start', async (req, res) => {
  const userID = req.query.userID;
  load;
  console.time('time');
  const scan = async () => {
    const jobScanner = JobsScanner();
  };
  console.timeEnd('time');
  const data = await scan();

  res.send(data);
});

(async () => {
  try {
    await mongoDB.connect();
    app.listen(5000, () => {
      console.log(`server listen on port ${PORT}`);
    });
  } catch (error) {
    await mongoDB.close();
  }
})();