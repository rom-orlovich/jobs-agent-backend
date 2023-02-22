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
exports.DrushimScanner = void 0;
const drushimQueryOptions_1 = require("./drushimQueryOptions");
const scanner_1 = require("../scanner");
class DrushimScanner extends scanner_1.Scanner {
    constructor(user, JobsDB) {
        super('drushim', user, JobsDB);
        this.drushimQueryOptions = new drushimQueryOptions_1.DrushimQueryOptions(user.userQuery);
    }
    getURL(page) {
        const { experience, scope, location, distance, position } = this.drushimQueryOptions;
        return `https://www.drushim.co.il/api/jobs/search?experience=${experience}&scope=${scope}&area=1&searchterm=${position}&geolexid=${location}&range=${distance}&ssaen=1&page=${page}&isAA=true`;
    }
    getJobsData(results) {
        if (!results)
            return [];
        return results.map((result) => ({
            jobID: String(result.Code),
            company: result.Company.CompanyDisplayName,
            link: 'https://www.drushim.co.il' + result.JobInfo.Link,
            location: result.JobContent.Addresses.map((el) => el.CityEnglish).join(','),
            title: result.JobContent.FullName,
            date: result.JobInfo.Date,
            from: this.scannerName,
            text: result.JobContent.Requirements,
            createdAt: new Date(),
        }));
    }
    getFilterData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobsPosts = this.getJobsData(data === null || data === void 0 ? void 0 : data.ResultList).filter(this.filterJobsPosts);
            const filterJobs = yield this.filterJobsExistInDB(jobsPosts, this.drushimQueryOptions.hash);
            return filterJobs;
        });
    }
    getNormalizeData(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getAxiosData(page);
            return this.getFilterData(data);
        });
    }
    scanning() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getAxiosData(0);
            if (!data)
                return [];
            let page = 1;
            const promises = [this.getFilterData(data)];
            while (page < ((data === null || data === void 0 ? void 0 : data.TotalPagesNumber) || 0)) {
                console.log(`Page number ${page}`);
                promises.push(this.getNormalizeData(page));
                page++;
            }
            const jobsPosts = yield this.getTranslateResultsScanning(promises);
            return jobsPosts;
        });
    }
}
exports.DrushimScanner = DrushimScanner;
// (async () => {
//   const drushim = new DrushimScanner(EXAMPLE_QUERY, profile, new JobsDB());
//   const t = await drushim.scanning();
//   console.log('Finish scanning drushim');
//   // console.log(t);
// })();
//# sourceMappingURL=drushimScanner.js.map