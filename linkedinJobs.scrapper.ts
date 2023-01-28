import axios from 'axios';
import { load } from 'cheerio';
import { writeFile, readFile } from 'fs/promises';
import { Job } from './lib';
import { Query } from './lib/query';
import path from 'path';

const getHTML = async (query: InstanceType<typeof Query>, start = 0) => {
  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${query.jobQuery}&location=${query.location}&locationId=&geoId=101570771&f_TPR=&distance=16&f_JT=F&f_E=2&start=${start}&f_T=${query.positionsQuery}`;
    console.log(url);
    const res = await axios(url);
    return res.data;
  } catch (error) {
    return '';
  }
};

const getJobData = (html: string, query: InstanceType<typeof Query>) => {
  const $ = load(html);
  const jobs = $('li');
  if (jobs.length === 0) return;
  let index = 0;
  return jobs.toArray().reduce((pre, cur) => {
    const jobTitle = $(cur).find('h3.base-search-card__title').text().trim();
    const company = $(cur).find('h4.base-search-card__subtitle').text().trim();
    const location = $(cur)
      .find('span.job-search-card__location')
      .text()
      .trim();
    const link = $(cur).find('a.base-card__full-link').attr('href');
    let insert = true;

    //Todo: Trie
    if (
      query.whiteList.length &&
      query.whiteList.some((wl) =>
        jobTitle.toLowerCase().includes(wl.toLowerCase())
      )
    )
      insert = true;

    if (
      query.blackList.length &&
      query.blackList.some((bl) =>
        jobTitle.toLowerCase().includes(bl.toLowerCase())
      )
    )
      insert = false;

    if (insert)
      pre.push({
        jobID: index++,
        jobTitle,
        company,
        location,
        link: link || '',
      });

    return pre;
  }, [] as unknown as Job[]);
};

async function createJobJSON(
  ...queryOptions: ConstructorParameters<typeof Query>
) {
  const jobs: Job[] = [];
  let start = 0;

  const q = new Query(...queryOptions);

  let obj: Job[] | undefined = [];
  while (obj && start < q.limit) {
    const data = await getHTML(q, start);

    obj = getJobData(data, q);

    if (obj) {
      jobs.push(...obj);
    }
    start += 25;
  }
  const positionsName = queryOptions[0].positions
    .join('_')
    .split(' ')
    .join('_')
    .toLocaleLowerCase();
  const jobSearch = queryOptions[0].jobQuery.split(' ').join('');
  const date = new Date().toLocaleDateString().split('/').join('-');
  const fileName = `${jobSearch || positionsName}-${date}.json`;
  await writeFile(
    path.join(__dirname, fileName),
    JSON.stringify(jobs),
    'utf-8'
  );

  console.log(`finish create ${fileName}`);
}

createJobJSON({
  jobQuery: '',
  positions: [
    'Frontend Developer',
    'Full Stack Engineer',
    'Javascript Developer',
  ],
  blackList: ['senior', 'lead', 'angular'],
  whiteList: ['react', 'javascript'],
});

async function scrapRequirements(path: string) {
  const html = await readFile(path, 'utf-8');

  const $ = load(html);
  const ul = $('.show-more-less-html--more ul');

  const d = ul
    .toArray()
    .filter((el) => {
      if (
        $(el)
          .text()
          .match(
            /\b(0-2|at least|\+[0-9]+)\s*years?\b.*\b(SQL|react|javascript)\b/i
          )
      )
        return true;
    })
    .map((el) => {
      return $(el).text();
    });
  console.log(d);
}

// scrapRequirements(path.join(__dirname, 'public', 'index.html'));
