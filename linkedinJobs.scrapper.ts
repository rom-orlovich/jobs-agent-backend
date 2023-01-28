import axios from 'axios';

import { writeFile, readFile } from 'fs/promises';
import { Job } from './lib/linkedinScrapper';
import { Query, ValueObj } from './lib/Query';
import path from 'path';

import { load, CheerioAPI, Cheerio, Element } from 'cheerio';
import { Profile, STACK } from './lib/Profile';

const getHTML = async (query: InstanceType<typeof Query>, start = 0) => {
  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${query.jobQuery}&location=${query.location}&f_TPR=${query.period}&distance=${query.distance}&f_E=2&start=${start}&f_T=${query.positionsQuery}&sortBy=${query.sortBy}`;
    console.log(url);
    const res = await axios(url);
    return res.data;
  } catch (error) {
    return '';
  }
};

const initGetJobData = (query: InstanceType<typeof Query>) => {
  let index = 1;
  return (html: string) => {
    const $ = load(html);
    const jobs = $('li');
    if (jobs.length === 0) return;

    return jobs.toArray().reduce((pre, cur) => {
      const jobTitle = $(cur).find('h3.base-search-card__title').text().trim();
      const company = $(cur)
        .find('h4.base-search-card__subtitle')
        .text()
        .trim();
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

      insert = true;

      return pre;
    }, [] as unknown as Job[]);
  };
};

const splitSentence = ($: CheerioAPI) => {
  const nodeArr = $('.show-more-less-html--more *').toArray();
  const nodeArrFilter = nodeArr.filter((el) => {
    return !!$(el).text();
  });
  const nodeTextsArr = nodeArrFilter.map((el) =>
    $(el)
      .text()
      .trim()
      .split(' ')
      .filter((el) => !!el)
  );

  return nodeTextsArr;
};

const loopOverTheString = (sentences: string[][]) => {
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    let yearsIndex = -1;
    let memo;
    for (let j = 0; j < sentence.length; j++) {
      const word = sentence[j];
      console.log(word);
      const langEx = STACK[word];
      if (word.match(/\+\d/g) && yearsIndex < 0) {
        yearsIndex = j;
        j = 0;
      }
      if (langEx !== memo && langEx) {
        const yearNum = Number(sentence[yearsIndex][1]);
        if (yearNum > langEx.max) {
          return false;
        } else {
          memo = langEx;
          j = yearsIndex + 1;
          yearsIndex = -1;
        }
      }
    }
  }
};
const profile = new Profile({
  overallEx: 1,
  techStackOptions: {
    techStack: STACK,
    checkStack: { disqualifyExcludeTech: false },
  },
});

async function scrapRequirements(path: string) {
  const html = await readFile(path, 'utf-8');

  const $ = load(html);
  const sentences = splitSentence($);

  console.log(sentences);
}

loopOverTheString([['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience']]);
// scrapRequirements(path.join(__dirname, 'public', 'ex.html'));

async function createJobJSON(
  ...queryOptions: ConstructorParameters<typeof Query>
) {
  const jobs: Job[] = [];
  let start = 0;

  const q = new Query(...queryOptions);

  let obj: Job[] | undefined = [];
  const getJobData = initGetJobData(q);
  while (obj && start < q.limit) {
    const data = await getHTML(q, start);

    obj = getJobData(data);
    console.log(obj);
    if (obj) {
      jobs.push(...obj);
    }
    start += 25;
  }
  const positionsName = queryOptions[0]?.positions
    ?.join('_')
    .split(' ')
    .join('_')
    .toLocaleLowerCase();
  const jobSearch = queryOptions[0].jobQuery?.split(' ').join('');
  const date = new Date().toLocaleDateString().split('/').join('-');
  const fileName = `${date}.json`;
  await writeFile(
    path.join(__dirname, fileName),
    JSON.stringify(jobs),
    'utf-8'
  );

  console.log(`finish create ${fileName}`);
}

// createJobJSON({
//   sortBy: 'recent',
//   period: 'past week',
//   jobQuery: 'React.js',
//   distance: '10 mi (15km)',
//   location: 'Tel Aviv',
//   // positions: [
//   //   'Frontend Developer',
//   //   'Full Stack Engineer',
//   //   'Javascript Developer',
//   // ],
//   blackList: ['senior', 'lead', 'angular'],
//   whiteList: ['react', 'javascript'],
// });
