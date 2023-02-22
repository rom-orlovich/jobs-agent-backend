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
exports.JobsDB = void 0;
const server_1 = require("../src/server");
const hashQuery_1 = require("../src/jobsScanner/user/hashQuery");
class JobsDB {
    constructor() {
        this.jobsDB = server_1.mongoDB.createDBcollection('jobs-agent-db', 'jobs');
    }
    /**
     * Create ttl(Time to live) index for jobs collections.
     * Check if the ttl index is exist. If it doesn't create one.
     * Otherwise, print appropriate message.
     */
    createTTLindex() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.jobsDB.createIndex({ createdAt: 1 }, { expireAfterSeconds: hashQuery_1.EXPIRE_AT_MONGO_DB });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    getJob(jobID) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const job = yield ((_a = this.jobsDB) === null || _a === void 0 ? void 0 : _a.findOne({
                    jobID,
                }));
                return job ? job : undefined;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    /**
     * @param {string} hashQuery that represent the user's query object.
     * @returns {Promise<JobPost[]>} All user's jobsPosts that match the user's hashQueries.
     */
    getJobsByHash(hashQuery) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobsPosts = (_a = this.jobsDB) === null || _a === void 0 ? void 0 : _a.aggregate([
                    { $match: { hashQueries: { $elemMatch: { $eq: hashQuery } } } },
                    {
                        $project: { hashQueries: 0, createdAt: 0, _id: 0 },
                    },
                ]);
                return yield jobsPosts.toArray();
            }
            catch (error) {
                return [];
            }
        });
    }
    /**
     * Gets all the jobsPosts that match the user history queries by their current hashQueries array.
     * @param {string[]} hashQueries  User's HashQueries string array.
     * @returns {Promise<JobPost[]>} All user's jobsPosts that match the user's hashQueries array.
     */
    getJobsByHashQueries(hashQueries) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const job = (_a = this.jobsDB) === null || _a === void 0 ? void 0 : _a.aggregate([
                    { $match: { hashQueries: { $elemMatch: { $in: hashQueries } } } },
                    {
                        $project: { hashQueries: 0, createdAt: 0, _id: 0 },
                    },
                ]);
                return yield job.toArray();
            }
            catch (error) {
                return [];
            }
        });
    }
    insertOne(job) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const insert = yield this.jobsDB.insertOne(job);
                return insert;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    updateOne(jobID, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const update = yield this.jobsDB.updateOne({ jobID }, { $set: { createdAt: new Date() }, $addToSet: { hashQueries: hash } });
                return update.modifiedCount;
            }
            catch (error) {
                return;
            }
        });
    }
    insertMany(jobs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const insert = yield this.jobsDB.insertMany(jobs);
                return insert;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.JobsDB = JobsDB;
//# sourceMappingURL=jobsDB.js.map