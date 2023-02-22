"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinQueryOptions = exports.BLACK_LIST_WORDS = void 0;
const generalQuery_1 = require("../../generalQuery/generalQuery");
const PERIOD = {
    'past month': 'r2592000',
    'past week': 'r604800',
    '24hr': 'r86400',
};
exports.BLACK_LIST_WORDS = ['Angular', 'Senior', 'Lead'];
const SORT_BY = {
    relevant: 'R',
    recent: 'DD',
};
class LinkedinQueryOptions extends generalQuery_1.GeneralQuery {
    constructor(userInput) {
        super('linkedin', userInput);
        this.period = this.convertPeriod();
        this.sortBy = this.convertSortBy();
    }
    convertLocation() {
        var _a;
        const userInput = this.userInput.location;
        return ((_a = this.queryOptions.locations[userInput]) === null || _a === void 0 ? void 0 : _a.en) || '';
    }
    convertScope() {
        let scopesArr = [];
        if (!this.userInput.scope)
            return '';
        const userInputSplit = this.userInput.scope.split(',');
        scopesArr = userInputSplit.map((el) => {
            const scope = el;
            return this.queryOptions.scope.linkedin.f_JT[scope];
        });
        return scopesArr.join('%2C');
    }
    convertJobType() {
        let jobTypeArr = [];
        if (!this.userInput.jobType)
            return '';
        const userInputSplit = this.userInput.jobType.split(',');
        jobTypeArr = userInputSplit.map((el) => {
            const jobType = el;
            return this.queryOptions.jobType.linkedin.f_WT[jobType];
        });
        return jobTypeArr.join('%2C');
    }
    convertPosition() {
        const userInput = this.userInput.position;
        return this.queryOptions.positions[userInput].en;
    }
    convertPeriod(period = 'past month') {
        return PERIOD[period];
    }
    convertSortBy(sortBy = 'relevant') {
        return SORT_BY[sortBy];
    }
}
exports.LinkedinQueryOptions = LinkedinQueryOptions;
//# sourceMappingURL=linkedinQueryOptions.js.map