import axios from 'axios';

import { writeFile, readFile } from 'fs/promises';
import { Job } from '../lib/types/linkedinScrapper';
import { Query } from '../lib/Query';
import path from 'path';

import { load, Element, Cheerio } from 'cheerio';
import { Profile } from '../lib/Profile';
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
      .split(' ')
      .filter((el) => !!el)
  );

  return nodeTextsArr;
};

export const loopOverTheString = (profile: Profile, sentences: string[][]) => {
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    let yearsIndex = -1;
    let digitMatch: RegExpMatchArray | null = null;
    let memo;
    for (let j = 0; j < sentence.length; j++) {
      const word = sentence[j];
      // Check if the word is include in the excluded tech
      if (profile.getExcludeTech(word)) {
        return false;
      }
      // Check a match of digit is already exist.
      if (!digitMatch) {
        digitMatch = word.match(/\d\d|\d-\d|\d/g);

        // Check if there is match.
        // If it does check if the next word contains the word 'year'.
        if (
          digitMatch &&
          j < sentence.length - 1 &&
          sentence[j + 1].match(/year/)
        ) {
          // Check if the match is range.
          if (digitMatch[0][1] === '-') {
            const [min, max] = digitMatch[0].split('-');
            if (profile.overallEx && Number(min) > profile.overallEx)
              return false;
          }
          if (profile.overallEx && Number(digitMatch[0]) > profile.overallEx)
            return false;
          yearsIndex = j;
          j = 0;
        }
      }

      const langEx = profile.getRequirement(word);
      if (langEx) memo = langEx;

      if (memo && digitMatch) {
        if (digitMatch[0][1] === '-') {
          const [min, max] = digitMatch[0].split('-');
          if (Number(min) > memo.max) return false;
        }
        const yearNum = Number(digitMatch[0]);

        if (yearNum > memo.max) {
          return false;
        } else {
          j = yearsIndex + 1;
          yearsIndex = -1;
        }
        digitMatch = null;
      }
    }
    digitMatch = null;
    memo = undefined;
  }

  return true;
};

async function scrapRequirements(profile: Profile, path: string) {
  const html = await readFile(path, 'utf-8');
  const domApi = new CheerioDom(html);
  // const $ = load(html);

  const elements = domApi.toArray('.show-more-less-html--more ul *');

  const sentences = splitSentence(elements);

  console.log(sentences);
}
// console.log(path.join(__dirname, 'public', 'ex2.html'));
// scrapRequirements(profile, path.join(__dirname, '../', 'public', 'ex5.html'));

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
