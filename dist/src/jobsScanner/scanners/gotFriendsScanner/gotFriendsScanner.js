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
exports.GotFriendsScanner = void 0;
const scanner_1 = require("../scanner");
const gotFriendsQuery_1 = require("./gotFriendsQuery");
const throat_1 = __importDefault(require("throat"));
const utils_1 = require("../../../../lib/utils");
const puppeteerSetup_1 = require("../../../../lib/puppeteerSetup");
class GotFriendsScanner extends scanner_1.Scanner {
    constructor(user, JobsDB) {
        super('gotFriends', user, JobsDB);
        this.gotFriendsQuery = new gotFriendsQuery_1.GotFriendQueryOptions(user.userQuery);
    }
    initialFilters(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const { radioAreas, checkboxProfessions, location } = this.gotFriendsQuery;
            yield page.click('#professionAreaTitle');
            yield page.click(`label[for='${radioAreas}']`);
            yield page.click('#professionTitle');
            yield page.click(`label[for='${checkboxProfessions}']`);
            yield page.click('#regionTitle');
            yield page.click(`li label[for='${location}']`);
            yield page.click('#searchButton');
        });
    }
    getNumPagesLinks(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield page.waitForSelector('.pagination li a');
            const numPagesLinks = yield page.$$eval('.pagination li a', (el) => el.map((el) => el.href));
            return numPagesLinks;
        });
    }
    getAllJobsPostData(scannerName, createdAt) {
        const jobsPosts = Array.from(document.querySelectorAll('.panel .item'));
        return jobsPosts.map((job) => {
            var _a, _b, _c, _d, _e, _f;
            const jobLink = job.querySelector('a.position');
            const link = (jobLink === null || jobLink === void 0 ? void 0 : jobLink.href) || '';
            const text = ((_a = job.querySelector('.desc:nth-of-type(2)')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
            const jobID = ((_c = (_b = job.querySelector('.career_num')) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.split(':')[1].trim()) || '';
            const title = ((_d = jobLink === null || jobLink === void 0 ? void 0 : jobLink.textContent) === null || _d === void 0 ? void 0 : _d.trim().replace(/\n/, '')) || '';
            const location = ((_f = (_e = job.querySelector('.info-data')) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '';
            return {
                link,
                title,
                jobID,
                location,
                company: '',
                from: scannerName,
                text,
                createdAt: createdAt,
            };
        });
    }
    getFilterResults(jobsPosts) {
        return __awaiter(this, void 0, void 0, function* () {
            const filterJobs = jobsPosts.filter(this.filterJobsPosts);
            const filterJobsFromDB = yield this.filterJobsExistInDB(filterJobs, this.gotFriendsQuery.hash);
            return filterJobsFromDB;
        });
    }
    getJobsFromEachPage(browser) {
        return (url) => __awaiter(this, void 0, void 0, function* () {
            const newPage = yield browser.newPage();
            console.log(url);
            let jobsPosts = [];
            yield (0, utils_1.untilSuccess)(() => __awaiter(this, void 0, void 0, function* () {
                yield newPage.goto(url);
                jobsPosts = yield newPage.evaluate(this.getAllJobsPostData, this.scannerName, new Date());
            }));
            const filterJobs = this.getFilterResults(jobsPosts);
            yield newPage.close();
            return filterJobs;
        });
    }
    initPuppeteer() {
        return __awaiter(this, void 0, void 0, function* () {
            const { browser, page } = yield puppeteerSetup_1.PuppeteerSetup.lunchInstance({
                // headless: false,
                defaultViewport: null,
                args: ['--no-sandbox'],
                slowMo: 100,
            });
            yield page.goto('https://www.gotfriends.co.il/jobs/');
            yield this.initialFilters(page);
            const numPagesLinks = yield this.getNumPagesLinks(page);
            const promises = numPagesLinks
                .slice(0, 50)
                .map((0, throat_1.default)(10, this.getJobsFromEachPage(browser)))
                .flat(1);
            const jobsPosts = yield this.getTranslateResultsScanning(promises);
            yield browser.close();
            return jobsPosts;
        });
    }
    scanning() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.gotFriendsQuery.checkboxProfessions || !this.gotFriendsQuery.radioAreas) {
                console.log('There are no jobs in GotFriends that match the query.');
                return [];
            }
            const results = yield this.initPuppeteer();
            return results;
        });
    }
}
exports.GotFriendsScanner = GotFriendsScanner;
// (async () => {
//   const got = new GotFriendsScanner(EXAMPLE_QUERY, profile, new JobsDB());
//   const t = await got.scanning([]);
//   console.log('Finish scanning');
//   console.log(t);
// })();
//# sourceMappingURL=gotFriendsScanner.js.map