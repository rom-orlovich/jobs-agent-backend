import axios from 'axios';

import { writeFile, readFile } from 'fs/promises';
import { Job } from '../lib/types/linkedinScrapper';
import { Query, queryOptions } from '../lib/Query';
import path from 'path';

import { load, Element, Cheerio } from 'cheerio';
import { Profile, profile } from '../lib/Profile';
import { CheerioDom } from '../lib/CheerioDom';

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

const splitSentence = (elements: Cheerio<Element>[]) => {
  const nodeArrFilter = elements.filter((el) => {
    return el.text();
  });

  const nodeTextsArr = nodeArrFilter.map((el) =>
    el
      .text()
      .trim()
      .split(' ')
      .filter((el) => !!el)
  );

  return nodeTextsArr;
};

// const loop = (
//   i: number,
//   arr: string[],
//   wordExclude: string,
//   wordInclude: string
// ) => {
//   if (i === arr.length) return arr.length;

//   if (wordExclude === arr[i]) return i;

//   if (wordInclude === arr) {
//   }
// };

export const loopOverTheString = (profile: Profile, sentences: string[][]) => {
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    let yearsIndex = -1;
    let match: RegExpMatchArray | null = null;
    let memo;
    for (let j = 0; j < sentence.length; j++) {
      const word = sentence[j];
      if (profile.getExcludeTech(word)) {
        return false;
      }

      if (!match) {
        match = word.match(/\d\d|\d-\d|\d/g);
        if (j < sentence.length - 1 && match && sentence[j + 1].match(/year/)) {
          if (match && Number(match[0]) > profile.overallEx) return false;
          yearsIndex = j;
          j = 0;
        }
      }

      const langEx = profile.getRequirement(word);
      if (langEx) memo = langEx;

      if (memo && match) {
        const yearNum = Number(match[0]);

        if (yearNum > memo.max) {
          return false;
        } else {
          j = yearsIndex + 1;
          yearsIndex = -1;
        }
        match = null;
      }
    }
    match = null;
    memo = undefined;
  }

  return true;
};

// loopOverTheString(profile, [
//   ['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience'],
//   ['javascript', '14+', '-', '2+', 'years', 'of', 'experience'],
//   ['Any', 'NoSQL', 'DB', '–', '3+', 'years', 'of', 'experience'],
//   ['Experience', 'with', 'Rest', 'API', 'development'],
//   ['Performance', 'and', 'security-first', 'thinking'],
//   ['Team', 'player'],
// ]);

async function scrapRequirements(profile: Profile, path: string) {
  const html = await readFile(path, 'utf-8');
  const { toArray } = new CheerioDom(html);
  // const $ = load(html);
  const elements = toArray('.show-more-less-html--more *');

  const sentences = splitSentence(elements);

  console.log(sentences);
}
// scrapRequirements(profile, path.join(__dirname, 'public', 'ex.html'));

const initGetJobData = (query: InstanceType<typeof Query>) => {
  let index = 1;
  return (html: string) => {
    const $ = load(html);
    const jobs = $('li');
    if (jobs.length === 0) return;

    return jobs.toArray().reduce((pre, cur) => {
      const jobTitle = $(cur).find('h3.base-search-card__title').text().trim();

      if (
        query.blackList.length &&
        query.blackList.some((bl) => {
          console.log(jobTitle.toLowerCase(), bl.toLowerCase());
          console.log(jobTitle.toLowerCase().includes(bl.toLowerCase()));
          return jobTitle.toLowerCase().includes(bl.toLowerCase());
        })
      )
        return pre;

      if (
        query.whiteList.length === 0 ||
        (query.whiteList.length &&
          query.whiteList.some((wl) =>
            jobTitle.toLowerCase().includes(wl.toLowerCase())
          ))
      ) {
        const company = $(cur)
          .find('h4.base-search-card__subtitle')
          .text()
          .trim();
        const location = $(cur)
          .find('span.job-search-card__location')
          .text()
          .trim();
        const link = $(cur).find('a.base-card__full-link').attr('href');

        pre.push({
          jobID: index++,
          jobTitle,
          company,
          location,
          link: link || '',
        });
      }

      return pre;
    }, [] as unknown as Job[]);
  };
};

async function createJobJSON(queryOptions: Query, profile: Profile) {
  const jobs: Job[] = [];
  let start = 0;

  let obj: Job[] | undefined = [];
  const getJobData = initGetJobData(queryOptions);
  while (obj && start < queryOptions.limit) {
    const data = await getHTML(queryOptions, start);

    obj = getJobData(data);

    if (obj) {
      jobs.push(...obj);
    }
    start += 25;
  }

  const date = new Date().toLocaleDateString().split('/').join('-');
  const fileName = `${date}.json`;
  await writeFile(
    path.join(__dirname, fileName),
    JSON.stringify(jobs),
    'utf-8'
  );

  console.log(`finish create ${fileName}`);
}

// createJobJSON(queryOptions, profile);
