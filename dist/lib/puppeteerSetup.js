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
exports.PuppeteerSetup = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class PuppeteerSetup {
    static noImageRequest(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield page.setRequestInterception(true);
            page.on('request', (req) => {
                if (req.resourceType() === 'image') {
                    req.abort();
                }
                else {
                    req.continue();
                }
            });
        });
    }
    static lunchInstance(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer_1.default.launch(Object.assign({ headless: true }, options));
            const page = yield browser.newPage();
            page.on('console', (msg) => {
                for (let i = 0; i < msg.args().length; ++i)
                    console.log(`${i}: ${msg.args()[i]}`);
            });
            yield PuppeteerSetup.noImageRequest(page);
            return { page, browser };
        });
    }
    static evaluateContent(page, html, cb, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield page.setContent(html);
            return yield page.evaluate(cb, ...args);
        });
    }
}
exports.PuppeteerSetup = PuppeteerSetup;
//# sourceMappingURL=puppeteerSetup.js.map