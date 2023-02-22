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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllJobScanner = void 0;
const scanner_1 = require("../scanner");
const allJobQueryOptions_1 = require("./allJobQueryOptions");
const cheerio_1 = require("cheerio");
class AllJobScanner extends scanner_1.Scanner {
    constructor(user, JobsDB) {
        super('allJobs', user, JobsDB);
        this.allJobsQueryOptions = new allJobQueryOptions_1.AllJobsQueryOptions(user.userQuery);
    }
    getURL(page = 1) {
        const { location, distance, position, jobType } = this.allJobsQueryOptions;
        return `https://www.alljobs.co.il/SearchResultsGuest.aspx?type=${jobType}&page=${page}&freetxt=${position}&type=37&source=${location}&duration=${distance}`;
    }
    getAllJobsData($) {
        return __awaiter(this, void 0, void 0, function* () {
            return $('.job-content-top')
                .toArray()
                .map((el) => {
                const titleEl = $(el).find('.job-content-top a[title]');
                const title = titleEl.find('h3').text();
                const link = `https://www.alljobs.co.il` + titleEl.attr('href') || '';
                const linkSplit = link.split('=');
                const jobID = linkSplit[linkSplit.length - 1];
                const company = $(el).find('.T14 a:first-child').text().trim();
                const location = $(el)
                    .find('.job-content-top-location a')
                    .toArray()
                    .map((el) => $(el).text())
                    .join(',');
                const text = $(el).find('.PT15').text().trim();
                return {
                    jobID,
                    title,
                    link,
                    company,
                    location,
                    text,
                    from: this.scannerName,
                    createdAt: new Date(),
                };
            });
        });
    }
    get$(page = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = yield this.getAxiosData(page);
            const $ = (0, cheerio_1.load)(html || '');
            return $;
        });
    }
    getDataFromHTML(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield this.get$(page);
            const jobsPosts = (yield this.getAllJobsData($)).filter(this.filterJobsPosts);
            const filterJobs = yield this.filterJobsExistInDB(jobsPosts, this.allJobsQueryOptions.hash);
            return filterJobs;
        });
    }
    scanning() {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield this.get$(0);
            const maxPages = Number($('#hdnTotalPages').val());
            const promises = [];
            let page = 0;
            while (page < maxPages) {
                console.log(`Page number ${page}`);
                promises.push(this.getDataFromHTML(page));
                page++;
            }
            const jobs = yield this.getTranslateResultsScanning(promises);
            return jobs;
        });
    }
}
exports.AllJobScanner = AllJobScanner;
// (async () => {
//   const lin = new AllJobScanner(EXAMPLE_QUERY, profile, new JobsDB());
//   const t = await lin.scanning([]);
//   console.log(t);
//   console.log('finish scanning AllJobs');
// })();
//# sourceMappingURL=allJobScanner.js.map