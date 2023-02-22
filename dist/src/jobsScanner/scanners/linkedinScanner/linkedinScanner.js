"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinScanner = void 0;
const scanner_1 = require("../scanner");
const linkedinQueryOptions_1 = require("./linkedinQueryOptions");
const throat_1 = __importDefault(require("throat"));
const utils_1 = require("../../../../lib/utils");
const puppeteerSetup_1 = require("../../../../lib/puppeteerSetup");
class LinkedinScanner extends scanner_1.Scanner {
    constructor(user, jobsDB) {
        super('linkedin', user, jobsDB);
        this.linkedinQuery = new linkedinQueryOptions_1.LinkedinQueryOptions(user.userQuery);
        this.domain = 'https://www.linkedin.com/jobs';
    }
    setAPIDomain() {
        this.domain = 'http://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings';
    }
    getURL(start) {
        const { jobType, experience, location, position, distance, scope, period, sortBy } = this.linkedinQuery;
        const url = `${this.domain}/search?keywords=${position}&location=${location}&f_TPR=${period}&distance=${distance}&f_E=${experience}&f_JT=${scope}&sortBy=${sortBy}&f_WT=${jobType}&start=${start}`;
        return url;
    }
    getAllJobsPostData(scannerName, createdAt) {
        const jobDIVList = Array.from(document.body.querySelectorAll('.job-search-card'));
        if (jobDIVList.length === 0)
            return [];
        return jobDIVList.map((jobDIV) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const jobMetaData = (jobDIV === null || jobDIV === void 0 ? void 0 : jobDIV.dataset['entityUrn']) || '';
            const jobMetaDataSplit = jobMetaData === null || jobMetaData === void 0 ? void 0 : jobMetaData.split(':');
            const jobID = jobMetaDataSplit[jobMetaDataSplit.length - 1];
            const link = ((_a = jobDIV === null || jobDIV === void 0 ? void 0 : jobDIV.querySelector('a.base-card__full-link')) === null || _a === void 0 ? void 0 : _a.href.trim()) || '';
            const title = ((_c = (_b = jobDIV === null || jobDIV === void 0 ? void 0 : jobDIV.querySelector('h3.base-search-card__title')) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
            const company = ((_e = (_d = jobDIV === null || jobDIV === void 0 ? void 0 : jobDIV.querySelector('h4.base-search-card__subtitle')) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) || '';
            const location = ((_g = (_f = jobDIV === null || jobDIV === void 0 ? void 0 : jobDIV.querySelector('span.job-search-card__location')) === null || _f === void 0 ? void 0 : _f.innerHTML) === null || _g === void 0 ? void 0 : _g.trim()) || '';
            const date = (_h = jobDIV === null || jobDIV === void 0 ? void 0 : jobDIV.querySelector('.job-search-card__listdate')) === null || _h === void 0 ? void 0 : _h.dateTime;
            return {
                jobID,
                link,
                title,
                company,
                location,
                date,
                from: scannerName,
                createdAt: createdAt,
                text: '',
            };
        });
    }
    getPageData(pageNum, browser) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield browser.newPage();
            const url = this.getURL(pageNum);
            console.log(`page num ${pageNum}`);
            yield scanner_1.Scanner.waitUntilScan(page, url, '.base-card');
            const jobsPosts = (yield page.evaluate(this.getAllJobsPostData, this.scannerName, new Date())).filter(this.filterJobsPosts);
            const filterJobs = yield this.filterJobsExistInDB(jobsPosts, this.linkedinQuery.hash);
            yield page.close();
            return filterJobs;
        });
    }
    getJobsPostPromises(numResults, browser) {
        return __awaiter(this, void 0, void 0, function* () {
            let start = 0;
            const promises = [];
            while (start < numResults) {
                const data = this.getPageData(start, browser);
                promises.push(data);
                start += 25;
            }
            const jobsPosts = (yield Promise.all((0, utils_1.throatPromises)(4, promises))).flat(1);
            console.log('number', jobsPosts.length);
            return jobsPosts;
        });
    }
    getTheAPIJobsPosts(browser) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.getURL(0));
            const page = yield browser.newPage();
            yield page.goto(this.getURL(0));
            const numResults = yield page.$eval('.results-context-header__job-count', (el) => Number(el.textContent));
            this.setAPIDomain();
            const jobsPosts = yield this.getJobsPostPromises(numResults || 500, browser);
            yield page.close();
            return jobsPosts;
        });
    }
    static getJobPostRequirementData() {
        var _a, _b;
        const ul = Array.from(document.body.querySelectorAll('.show-more-less-html ul li'));
        if (ul.length === 0) {
            return (((_b = (_a = document.body
                .querySelector('.show-more-less-html')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim().replace(/\n/g, '')) || '');
        }
        return ul
            .filter((el) => el.textContent)
            .map((el) => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); })
            .join(' ');
    }
    getJobPostDataOfEachPost(browser) {
        return (jobPost) => __awaiter(this, void 0, void 0, function* () {
            const REPage = yield browser.newPage();
            yield puppeteerSetup_1.PuppeteerSetup.noImageRequest(REPage);
            console.log(jobPost.link);
            yield scanner_1.Scanner.waitUntilScan(REPage, jobPost.link, '.show-more-less-html');
            const jobPostApiHTML = yield REPage.evaluate(LinkedinScanner.getJobPostRequirementData);
            yield REPage.close();
            const newJob = Object.assign(Object.assign({}, jobPost), { text: jobPostApiHTML });
            console.log(newJob);
            return newJob;
        });
    }
    initPuppeteer() {
        return __awaiter(this, void 0, void 0, function* () {
            const { browser } = yield puppeteerSetup_1.PuppeteerSetup.lunchInstance({
                // headless: false,
                defaultViewport: null,
                args: ['--no-sandbox'],
                slowMo: 200,
            });
            const jobsPosts = yield this.getTheAPIJobsPosts(browser);
            const promises = jobsPosts.map((0, throat_1.default)(4, this.getJobPostDataOfEachPost(browser)));
            try {
                const jobs = yield Promise.all(promises);
                console.log(`finish found ${jobs.length} jobs in linkedin`);
                yield browser.close();
                return jobs;
            }
            catch (error) {
                console.log(error);
                return [];
            }
        });
    }
    scanning() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.initPuppeteer();
        });
    }
}
exports.LinkedinScanner = LinkedinScanner;
// (async () => {
//   const lin = new LinkedinScanner(EXAMPLE_QUERY, profile, new JobsDB());
//   const t = await lin.scanning();
// })();
//# sourceMappingURL=linkedinScanner.js.map