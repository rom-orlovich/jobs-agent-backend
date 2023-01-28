import axios from 'axios';
import { load } from 'cheerio';
import { writeFile, readFile } from 'fs/promises';
import { Job } from './lib';
import { Query } from './lib/query';
import path from 'path';

const wordsDict = [
  'React',
  'Javascript',
  'Full Stack',
  'Frontend',
  'Backend',
  'Web',
  'Front End',
  'Back End',
];

const lan = [
  'Javascript',
  'React',
  'Typescript',
  'Nodejs',
  'node',
  'javascript',
  'mongoDB',
  'SQL',
];

const getHTML = async (query: InstanceType<typeof Query>, start = 0) => {
  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${query.jobQuery}&location=Tel+Aviv-Yafo,+Tel+Aviv+District,+Israel&locationId=&geoId=101570771&f_TPR=&distance=10&f_JT=F&f_E=2&start=${start}&f_T=${query.positionsQuery}`;
    console.log(url);
    const res = await axios(url);
    return res.data;
  } catch (error) {
    return '';
  }
};

const wordBlackList = ['Angular', 'Senior', 'Lead'];
const getJobData = (html: string) => {
  const $ = load(html);
  const jobs = $('li');
  if (jobs.length === 0) return;
  return jobs.toArray().reduce((pre, cur) => {
    const jobTitle = $(cur).find('h3.base-search-card__title').text().trim();
    const company = $(cur).find('h4.base-search-card__subtitle').text().trim();
    const location = $(cur)
      .find('span.job-search-card__location')
      .text()
      .trim();
    const link = $(cur).find('a.base-card__full-link').attr('href');
    if (
      wordsDict.some(
        (el) =>
          jobTitle.includes(el) &&
          wordBlackList.every((el) => !jobTitle.includes(el))
      )
    )
      pre.push({
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

    obj = getJobData(data);

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
  positions: ['Automation Engineer', 'Back End Developer'],
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
