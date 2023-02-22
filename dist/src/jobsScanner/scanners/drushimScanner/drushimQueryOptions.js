"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrushimQueryOptions = void 0;
const generalQuery_1 = require("../../generalQuery/generalQuery");
class DrushimQueryOptions extends generalQuery_1.GeneralQuery {
    constructor(userInput) {
        super('drushim', userInput);
    }
    convertLocation() {
        const userInput = this.userInput.location;
        return this.queryOptions.locations[userInput].geolexid;
    }
    getScopeStr() {
        if (!this.userInput.scope)
            return '';
        const userInputSplit = this.userInput.scope.split(',');
        const scopesArr = userInputSplit.map((el) => {
            const scope = el;
            return this.queryOptions.scope.drushim.scope[scope];
        });
        const scopesStr = scopesArr.join('-');
        return scopesStr;
    }
    getJobType() {
        const jobType = this.userInput.jobType;
        const jobTypeRes = this.queryOptions.jobType.drushim.scope[jobType] || '';
        return jobTypeRes;
    }
    convertScope() {
        const userInputSplit = this.userInput.scope.split(',');
        if (userInputSplit.length === 0)
            return '';
        const scopeStr = this.getScopeStr();
        const jobTypeRes = this.getJobType();
        return `${scopeStr}${jobTypeRes ? `-${jobTypeRes}` : ''}`;
    }
    convertJobType() {
        return '';
    }
}
exports.DrushimQueryOptions = DrushimQueryOptions;
//# sourceMappingURL=drushimQueryOptions.js.map