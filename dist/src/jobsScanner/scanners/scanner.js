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
exports.Scanner = void 0;
const axios_1 = __importDefault(require("axios"));
const googleTranslate_1 = require("../googleTranslate/googleTranslate");
const utils_1 = require("../../../lib/utils");
const requirementsReader_1 = require("../requirementsReader/requirementsReader");
class Scanner {
    constructor(scannerName, user, jobsDB) {
        this.jobMap = new Map();
        this.user = user;
        this.googleTranslate = new googleTranslate_1.GoogleTranslate({ op: 'translate', from: 'he', to: 'en' });
        this.scannerName = scannerName;
        this.jobsDB = jobsDB;
    }
    getURL(...args) {
        throw new Error('Method not implemented.');
    }
    getAxiosData(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.getURL(page);
            console.log(url);
            try {
                const res = yield (0, axios_1.default)(url);
                const data = res.data;
                return data;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    filterJobsPosts() {
        return (curJob) => {
            if (this.jobMap.get(curJob.jobID))
                return false;
            else
                this.jobMap.set(curJob.jobID, true);
            if (!curJob.link || !curJob.jobID || !curJob.title)
                return false;
            return true;
        };
    }
    filterJobsExistInDB(jobsPosts, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const filterResults = [];
            for (const jobPost of jobsPosts) {
                const isExist = yield this.jobsDB.updateOne(jobPost.jobID, hash);
                if (!isExist)
                    filterResults.push(jobPost);
            }
            return filterResults;
        });
    }
    static waitUntilScan(page, url, selector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!url)
                return;
            yield (0, utils_1.untilSuccess)(() => __awaiter(this, void 0, void 0, function* () {
                yield page.goto('https://google.com/', { waitUntil: 'load' });
                yield page.goto(url, { waitUntil: 'load' });
                yield page.waitForSelector(selector, { timeout: 3000 });
            }));
        });
    }
    getTranslateResultsScanning(promises, throatNum = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobsPosts = (yield Promise.all((0, utils_1.throatPromises)(throatNum, promises))).flat(1);
            const jobsPostsWithTranslate = yield this.googleTranslate.translateArrayText(jobsPosts);
            return jobsPostsWithTranslate;
        });
    }
    scanning() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    insertManyDB(jobsPosts, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.jobsDB.insertMany(jobsPosts.map((el) => (Object.assign(Object.assign({}, el), { hashQueries: [hash] }))));
        });
    }
    filterResults(jobsPosts) {
        const jobsPostsFilter = jobsPosts.filter((el) => !this.user.checkWordInBlackList(el.title));
        return requirementsReader_1.RequirementsReader.checkRequirementMatchForArray(jobsPostsFilter, this.user);
    }
    getResults() {
        return __awaiter(this, void 0, void 0, function* () {
            const jobsPosts = yield this.scanning();
            console.log(`finish found ${jobsPosts.length} jobs in ${this.scannerName}`);
            if (jobsPosts.length)
                yield this.insertManyDB(jobsPosts, this.user.getCurrentHashQuery());
            return this.filterResults(jobsPosts);
        });
    }
}
exports.Scanner = Scanner;
//# sourceMappingURL=scanner.js.map