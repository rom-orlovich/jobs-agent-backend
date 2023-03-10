import { config } from 'dotenv';
config();
import Express from 'express';
import { MongoDBClient } from '../../mongoDB/mongoClient';
import { RabbitMQ } from '../../rabbitMQ/rabbitMQ';
import cors from 'cors';
import { validateBeforeScanner } from './controllers/middleware';
import cluster from 'cluster';
import os from 'os';
import { checkScannerStatus, processMesFun, startScanner } from './controllers/startScanner';
import { downloadJobs } from './controllers/downloadJobs';
import { getJobs } from './controllers/getJobs';

const totalCPUs = process.env.TOTAL_CPU || os.cpus().length;
const app = Express();
const PORT = process.env.PORT || 5000;

export const mongoDB = new MongoDBClient();
export const rabbitMQ = new RabbitMQ();
export const SCANNING_QUEUE = 'scanning';
const expressServer = () => {
  app.use(
    cors({
      origin: [
        process.env.CLIENT_URL_PRO || '',
        process.env.CLIENT_URL_DEV || '',
        'http://localhost:3000',
      ],
      credentials: true,
    })
  );
  app.get('/api/jobs-agent/start/:userID', validateBeforeScanner, startScanner);
  app.get('/api/jobs-agent/download/:userID', validateBeforeScanner, downloadJobs);
  app.get('/api/jobs-agent/jobs/:userID', validateBeforeScanner, getJobs);

  app.get('/api/jobs-agent/test/:userID', async (req, res) => {
    const id = new Date().getTime().toString();
    const processMes = processMesFun(id);

    new Promise((res) => {
      return setTimeout(() => {
        return res(null);
      }, 1000 * 5);
    }).then(() => {
      rabbitMQ.sendMessage(SCANNING_QUEUE, processMes('SUCCESS'));
    });

    return res.status(200).send(processMes('PENDING'));
  });

  app.get('/api/jobs-agent/scanning/checkStatus/:processID', checkScannerStatus);

  console.log('start');
  app.listen(PORT, () => {
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
      console.log(error);
      await mongoDB.close();
    }
  } else {
    await rabbitMQ.connect();
    await rabbitMQ.createChannel();
    await rabbitMQ.assertQueue(SCANNING_QUEUE);
    expressServer();
  }
};

startClusters();
