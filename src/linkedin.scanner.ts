import axios from 'axios';

import { writeFile, readFile } from 'fs/promises';
import { Job } from '../lib/types/linkedinScrapper';
import { Query } from '../lib/Query';
import path from 'path';

import { load, CheerioAPI } from 'cheerio';
import { Profile, REQUIREMENTS } from '../lib/Profile';

const profile = new Profile({
  overallEx: 1,
  RequirementsOptions: {
    requirements: REQUIREMENTS,
    excludeTech: { 'C#.NET': false },
  },
});

const queryOptions = new Query({
  sortBy: 'recent',
  period: 'past week',
  jobQuery: 'React.js',
  distance: '10 mi (15km)',
  location: 'Tel Aviv',
  // positions: [
  //   'Frontend Developer',
  //   'Full Stack Engineer',
  //   'Javascript Developer',
  // ],
  blackList: ['senior', 'lead', 'angular', 'devops', 'cloud', 'wordpress'],
  whiteList: [],
});

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

const loopOverTheString = (profile: Profile, sentences: string[][]) => {
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    let yearsIndex = -1;
    let memo;
    for (let j = 0; j < sentence.length; j++) {
      const word = sentence[j];

      const langEx = profile.Requirements.requirements[word];

      if (word.match(/\+\d/g) || (word.match(/\d\+/g) && yearsIndex < 0)) {
        yearsIndex = j;
        j = 0;
      }

      if (
        profile.Requirements.excludeTech &&
        profile.Requirements.excludeTech[word]
      ) {
        return false;
      }

      if (langEx !== memo && langEx && yearsIndex > 0) {
        console.log('y');
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
    memo = undefined;
  }
  console.log(true);

  return true;
};

loopOverTheString(profile, [
  ['C#.NET', 'Core', '–', '3+', 'years', 'of', 'experience'],
  ['javascript', '14+', '-', '2+', 'years', 'of', 'experience'],
  ['Any', 'NoSQL', 'DB', '–', '3+', 'years', 'of', 'experience'],
  ['Experience', 'with', 'Rest', 'API', 'development'],
  ['Performance', 'and', 'security-first', 'thinking'],
  ['Team', 'player'],
]);

async function scrapRequirements(profile: Profile, path: string) {
  const html = await readFile(path, 'utf-8');

  const $ = load(html);
  const sentences = splitSentence($);

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
