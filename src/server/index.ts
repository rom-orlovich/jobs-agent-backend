import { config } from 'dotenv';
config();
import Express from 'express';
import { MongoDBClient } from '../../mongoDB/mongoClient';

import cors from 'cors';
import { validateBeforeScanner } from './controllers/middleware';
import cluster from 'node:cluster';
import os from 'node:os';
import { startScanner } from './controllers/startScanner';
import { downloadJobs } from './controllers/downloadJobs';
import { getJobs } from './controllers/getJobs';

const totalCPUs = os.cpus().length;

const app = Express();
const PORT = 5000;

export const mongoDB = new MongoDBClient();

const expressServer = () => {
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.get('/api/jobs-agent/start/:userID', validateBeforeScanner, startScanner);
  app.get('/api/jobs-agent/download/:userID', validateBeforeScanner, downloadJobs);
  app.get('/api/jobs-agent/jobs/:userID', validateBeforeScanner, getJobs);

  console.log('start');
  app.listen(5000, () => {
    console.log(`server listen on port ${PORT}`);
  });
};

const startClusters = async () => {
  if (cluster.isPrimary) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);
    try {
      await mongoDB.connect();
      // Fork workers.
      for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Let's fork another worker!");
        cluster.fork();
      });
    } catch (error) {
      await mongoDB.close();
    }
  } else {
    expressServer();
  }
};

startClusters();
