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
exports.downloadResults = exports.startScanner = void 0;
const scanningFS_1 = require("../../lib/scanningFS");
const JobsScanner_1 = require("../jobsScanner/JobsScanner");
const activeScanner = (user, userDB, activeQuery) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobsScanner = new JobsScanner_1.JobsScanner(user, activeQuery);
        yield userDB.updateUser(user);
        console.time('time');
        const results = yield jobsScanner.getResults();
        console.timeEnd('time');
        return results;
    }
    catch (error) {
        console.log(error);
        return undefined;
    }
});
const writeResultsScanner = (user, activeQuery) => __awaiter(void 0, void 0, void 0, function* () {
    const jobsScanner = new JobsScanner_1.JobsScanner(user, activeQuery);
    try {
        const results = yield jobsScanner.getResults();
        yield scanningFS_1.ScanningFS.writeData(results);
        return true;
    }
    catch (error) {
        return false;
    }
});
const startScanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, activeQuery, usersDB } = req.validateBeforeScanner;
    //Active the scanner.
    const results = yield activeScanner(user, usersDB, activeQuery);
    if (results)
        return res.status(200).send(results);
    else
        return res.status(500).send({ message: 'Something went wrong' });
});
exports.startScanner = startScanner;
const downloadResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { activeQuery, user } = req.validateBeforeScanner;
    //Writes the results into csv file.
    const result = yield writeResultsScanner(user, activeQuery);
    if (result)
        return res.download(scanningFS_1.ScanningFS.createPathJobsCSV());
    return res.status(500).send({ message: 'Something went wrong' });
});
exports.downloadResults = downloadResults;
//# sourceMappingURL=controllers.js.map