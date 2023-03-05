/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { config } = require('dotenv');
config();
const { exec } = require('child_process');
const { mkdir, access, constants, writeFile, cp } = require('fs/promises');

const path = require('path');

const packageJson = {
  name: 'jobs-agent-backend-prod',
  version: '1.0.0',
  description: '',
  dependencies: {
    axios: '^1.2.5',
    cheerio: '^1.0.0-rc.12',
    cors: '^2.8.5',
    dotenv: '^16.0.3',
    'fs-extra': '^11.1.0',
    express: '^4.18.2',
    'google-translate-free': '^2.4.5',
    'json-2-csv': '^3.18.0',
    'linkedin-jobs-api': '^1.0.0',
    mongodb: '5.0',
    puppeteer: '^19.6.1',
    throat: '^6.0.2',
  },
  scripts: {
    start: 'node ./src/server/index.js',
    build: 'npm install && bash render-build.sh',
    keywords: [],
    author: '',
    license: 'ISC',
  },
};
const root = path.resolve('.');

const createDeployFolder = async () => {
  return await new Promise((res) => {
    exec('tsc', async () => {
      try {
        await mkdir('deploy', { cwd: root });
      } catch (error) {
        console.log(error);
      }

      await writeFile('./deploy/dist/package.json', JSON.stringify(packageJson));
      await cp('./render-build.sh', './deploy/dist/render-build.sh');
      await cp('./puppeteerrc.cjs', './deploy/dist/puppeteerrc.cjs');
      res();
    });
  });
};

const git = async () => {
  const commitMessage = process.argv[2] || 'default commit';
  const gitPush = 'git push origin main -f';
  const newCommit = `cd ./deploy && git add .&& git commit -m '${commitMessage}' && ${gitPush}`;

  try {
    console.log('check git exist');
    await access('./deploy/.git', constants.F_OK);

    exec(newCommit, (err) => {
      console.log('write commit', newCommit);
      if (err) console.log('please make change before commit');
    });
  } catch (error) {
    exec(
      "cd ./deploy && git init  && git add . && git commit -m 'my first commit' && git branch -m master main",
      (err) => {
        console.log('🚀 ~ file: deploy.js:58 ~ git ~ err:', err);
        console.log('initial .git');
        exec(`cd ./deploy && git remote add origin ${process.env.GIT_REPO_URL}`, (err) => {
          if (err) console.log('🚀 ~ file: deploy.js:66 ~ exec ~ err:', err);
          console.log('add origin');
          exec(`cd ./deploy &&  ${gitPush}`, (err) => {
            if (err) console.log('🚀 ~ file: deploy.js:65 ~ exec ~ err:', err);
            console.log('push to repo');
          });
        });
      }
    );
  }
};
const CD = async () => {
  await createDeployFolder();
  await git();
};
CD();
