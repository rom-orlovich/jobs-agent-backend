"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllJobsQueryOptions = void 0;
const generalQuery_1 = require("../../generalQuery/generalQuery");
class AllJobsQueryOptions extends generalQuery_1.GeneralQuery {
    constructor(userInput) {
        super('allJobs', userInput);
    }
    convertLocation() {
        const userInput = this.userInput.location;
        return String(this.queryOptions.locations[userInput].source);
    }
    convertJobType() {
        const userInputSplitJobType = this.userInput.jobType.split(',');
        const jobTypeArr = userInputSplitJobType.map((el) => {
            const jobType = el;
            if (jobType === '2')
                return this.queryOptions.jobType.allJobs['type'][2].region;
            return this.queryOptions.jobType.allJobs.type[jobType];
        });
        const userInputSplitScope = this.userInput.jobType.split(',');
        const jobScopeArr = userInputSplitScope.map((el) => {
            const scope = el;
            return this.queryOptions.scope.allJobs.type[scope];
        });
        return [...jobTypeArr, ...jobScopeArr].filter((el) => el).join(',');
    }
    convertScope() {
        return '';
    }
}
exports.AllJobsQueryOptions = AllJobsQueryOptions;
//# sourceMappingURL=allJobQueryOptions.js.map