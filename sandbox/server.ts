import Express, { response } from 'express';
import { exampleQuery, profile } from '..';
import { JobsDB } from '../lib/JobsDB';
import { LinkedinScanner } from '../src/LinkedinScanner/LinkedinScanner';
const app = Express();
const PORT = 5000;
app.get('/start', async (req, res) => {
  const scan = async () => {
    const lin = new LinkedinScanner(exampleQuery, profile, new JobsDB());
    const t = await lin.scanning([]);
    return t;
  };
  const data = await scan();
  res.send(data);
});

app.listen(5000, () => {
  console.log(`server listen on port ${PORT}`);
});
