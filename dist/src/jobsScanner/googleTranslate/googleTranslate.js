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
exports.GoogleTranslate = void 0;
const throat_1 = __importDefault(require("throat"));
const utils_1 = require("../../../lib/utils");
const axios_1 = __importDefault(require("axios"));
class GoogleTranslate {
    constructor(queryOptions) {
        this.queryOptions = queryOptions;
    }
    getURL(text) {
        const { op, to, from } = this.queryOptions;
        const params = new URLSearchParams();
        params.append('client', 'gtx');
        params.append('sl', from || 'auto');
        params.append('tl', to);
        params.append('hl', 'en-US');
        params.append('dt', 't');
        params.append('dt', 'bd');
        params.append('dj', '1');
        params.append('source', 'bubble');
        params.append('tk', '322062.322062');
        params.append('q', text);
        return { params, url: 'https://translate.googleapis.com/translate_a/single' };
    }
    transformToText(res) {
        const data = res.data;
        const translateText = data.sentences.map((el) => el.trans).join('');
        return translateText;
    }
    getTranslate(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, url } = this.getURL(text);
            let res;
            yield (0, utils_1.untilSuccess)(() => __awaiter(this, void 0, void 0, function* () {
                res = yield (0, axios_1.default)(url, {
                    params,
                    headers: { authority: 'translate.googleapis.com' },
                });
            }));
            if (!res)
                return '';
            return this.transformToText(res);
        });
    }
    translateArrayText(data, throatNum = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = data.map((0, throat_1.default)(throatNum, (rest) => __awaiter(this, void 0, void 0, function* () {
                const translateText = yield this.getTranslate(rest.text);
                const newJob = Object.assign(Object.assign({}, rest), { text: translateText });
                return newJob;
            })));
            const results = yield Promise.all(promises);
            return results;
        });
    }
}
exports.GoogleTranslate = GoogleTranslate;
//# sourceMappingURL=googleTranslate.js.map