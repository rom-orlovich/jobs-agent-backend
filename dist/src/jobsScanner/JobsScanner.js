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
exports.JobsScanner = void 0;
const jobsDB_1 = require("../../lib/jobsDB");
const requirementsReader_1 = require("./requirementsReader/requirementsReader");
const allJobScanner_1 = require("./scanners/allJobsScanner/allJobScanner");
const drushimScanner_1 = require("./scanners/drushimScanner/drushimScanner");
const gotFriendsScanner_1 = require("./scanners/gotFriendsScanner/gotFriendsScanner");
const linkedinScanner_1 = require("./scanners/linkedinScanner/linkedinScanner");
/**
 * The JobsScanner is responsible to create a instance of the jobs scanner.
 */
class JobsScanner {
    constructor(user, activeQuery) {
        this.user = user;
        this.activeQuery = activeQuery;
        this.jobsDB = new jobsDB_1.JobsDB();
    }
    /**
     * Initialize the instance of the scanners and start the scanning
     * in order to get their results.
     * @returns {Promise<JobPost[]>} Array of the JobsPost objects.
     */
    getScannerResults() {
        return __awaiter(this, void 0, void 0, function* () {
            const linkedinScanner = new linkedinScanner_1.LinkedinScanner(this.user, this.jobsDB);
            const gotFriendsScanner = new gotFriendsScanner_1.GotFriendsScanner(this.user, this.jobsDB);
            const allJobsScanner = new allJobScanner_1.AllJobScanner(this.user, this.jobsDB);
            const drushimScanner = new drushimScanner_1.DrushimScanner(this.user, this.jobsDB);
            const jobsPostsResults = yield Promise.all([
                linkedinScanner.getResults(),
                gotFriendsScanner.getResults(),
                allJobsScanner.getResults(),
                drushimScanner.getResults(),
            ]);
            return jobsPostsResults.flat(1);
        });
    }
    /**
     * @returns {Promise<JobPost[]>} Array of the JobsPost objects that match user's hashQuery.
     */
    getJobsByHash() {
        return __awaiter(this, void 0, void 0, function* () {
            const jobsPosts = yield this.jobsDB.getJobsByHash(this.user.getCurrentHashQuery());
            return jobsPosts;
        });
    }
    /**
     * Gets the jobsPosts that have the same hash as user's hashQuery.
     * If the amount of the jobs are lower than 100, use the hash results.
     * Otherwise create a new jobs scanner.
     * @returns {Promise<JobPost[]>} - Array of the JobsPost objects.
     */
    scanningByUserQuery() {
        return __awaiter(this, void 0, void 0, function* () {
            const preJobs = yield this.getJobsByHash();
            let jobsPosts;
            if (preJobs.length > 100)
                jobsPosts = preJobs;
            else
                jobsPosts = yield this.getScannerResults();
            return jobsPosts;
        });
    }
    /**
     *Create user's hashQuery string array and gets all the jobsPosts that match
     the user's history queries by their current hashQueries array.
     * @returns {Promise<JobPost[]>} - Array of the JobsPost objects.
     */
    scanningByCurrentUserQueryHashes() {
        return __awaiter(this, void 0, void 0, function* () {
            const hashesQueries = this.user.getCurrentHashQueries();
            const jobsPosts = this.jobsDB.getJobsByHashQueries(hashesQueries);
            return jobsPosts;
        });
    }
    scanning() {
        return __awaiter(this, void 0, void 0, function* () {
            let jobsPosts;
            if (this.activeQuery)
                jobsPosts = yield this.scanningByUserQuery();
            else
                jobsPosts = yield this.scanningByCurrentUserQueryHashes();
            yield this.jobsDB.createTTLindex(); //Create TTL (time to live).
            return jobsPosts;
        });
    }
    getResults() {
        return __awaiter(this, void 0, void 0, function* () {
            const jobsPosts = yield this.scanning();
            const filterJobs = requirementsReader_1.RequirementsReader.checkRequirementMatchForArray(jobsPosts, this.user);
            return filterJobs;
        });
    }
}
exports.JobsScanner = JobsScanner;
// (async () => {
//   await mongoDB.connect();
//   const n = new JobsScanner(profile, EXAMPLE_QUERY);
//   // n.hashQuery();
//   await n.scanning();
//   await mongoDB.close();
// })();
//# sourceMappingURL=JobsScanner.js.map