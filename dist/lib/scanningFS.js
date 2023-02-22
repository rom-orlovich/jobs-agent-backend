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
exports.ScanningFS = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const json_2_csv_1 = require("json-2-csv");
class ScanningFS {
    static createPathJobsJSON(fileName = `jobs.json`) {
        return path_1.default.join(__dirname, '../', 'JSON', fileName);
    }
    static createPathJobsCSV(fileName = 'jobs.csv') {
        return path_1.default.join(__dirname, '../', 'csv', fileName);
    }
    //Todo: move these function to fs class.
    static readJSON(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return JSON.parse(yield (0, promises_1.readFile)(path, 'utf8'));
            }
            catch (error) {
                console.log(error);
                return undefined;
            }
        });
    }
    static writeJSON(data, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.writeFile)(path, JSON.stringify(data), 'utf-8');
                console.log(`finish create json file in ${path}`);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    static orderKey(data) {
        return Object.keys(data[0])
            .sort((a, b) => {
            if (a.match(/id/gi))
                return -1;
            if (b.match(/id/gi))
                return 1;
            if (a === 'title')
                return -1;
            if (b === 'title')
                return 1;
            if (a === 'from')
                return -1;
            if (b === 'from')
                return 1;
            if (a === 'reason')
                return -1;
            if (b === 'reason')
                return 1;
            return 0;
        })
            .map((el) => ({ field: el, title: el }));
    }
    static writeCSV(data, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const csv = yield (0, json_2_csv_1.json2csvAsync)(data, {
                    keys: ScanningFS.orderKey(data),
                });
                yield (0, promises_1.writeFile)(path, csv || '', 'utf-8');
                console.log(`finish create json file in ${path}`);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    static readCSV(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const json = yield (0, promises_1.readFile)(path, 'utf8');
                const csv = yield (0, json_2_csv_1.csv2jsonAsync)(json);
                console.log(`finish create json file in ${path}`);
                return csv;
            }
            catch (error) {
                console.log(error);
                return [];
            }
        });
    }
    static loadData(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobs = yield ScanningFS.readCSV(ScanningFS.createPathJobsCSV(fileName));
            return jobs;
        });
    }
    static writeData(data, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobs = yield ScanningFS.writeCSV(data, ScanningFS.createPathJobsCSV(fileName));
            return jobs;
        });
    }
}
exports.ScanningFS = ScanningFS;
//# sourceMappingURL=scanningFS.js.map