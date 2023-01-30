import { queryOptions } from '../lib/Query';

import { profile } from '../lib/Profile';

import { JobsScan } from './JobsScan';

const main = async () => {
  const jobScan = new JobsScan(profile, queryOptions);
  await jobScan.scanning();
};

main();
