import { config } from 'dotenv';
config();
import Express from 'express';
import { MongoDBClient } from '../../lib/mongoClient';

import { downloadResults, startScanner } from './controllers';
import cors from 'cors';
import { validateBeforeScanner } from './middleware';

const app = Express();
const PORT = 5000;

export const mongoDB = new MongoDBClient();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.get('/api/jobs-agent/start/:userID', validateBeforeScanner, startScanner);
app.get('/api/jobs-agent/download/:userID', validateBeforeScanner, downloadResults);

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
