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
exports.throatPromises = exports.untilSuccess = exports.benchmarkTimeMS = void 0;
const throat_1 = __importDefault(require("throat"));
const benchmarkTimeMS = (cb) => __awaiter(void 0, void 0, void 0, function* () {
    console.time('Time:');
    yield cb();
    console.timeEnd('Time:');
});
exports.benchmarkTimeMS = benchmarkTimeMS;
const untilSuccess = (cb) => __awaiter(void 0, void 0, void 0, function* () {
    const isSuccess = true;
    while (isSuccess) {
        try {
            yield cb();
            return true;
        }
        catch (error) {
            console.log(error);
        }
    }
});
exports.untilSuccess = untilSuccess;
const throatPromises = (throatNum, promises) => promises.map((0, throat_1.default)(throatNum, (el) => el));
exports.throatPromises = throatPromises;
//# sourceMappingURL=utils.js.map