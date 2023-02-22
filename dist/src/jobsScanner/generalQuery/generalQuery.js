"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralQuery = void 0;
const scannerQueryOptions_1 = require("./scannerQueryOptions");
const crypto_1 = require("crypto");
class GeneralQuery {
    constructor(scannerName, UserQuery) {
        this.scannerName = scannerName;
        this.queryOptions = scannerQueryOptions_1.SCANNER_QUERY_OPTIONS;
        this.userInput = UserQuery;
        this.location = this.convertLocation().split(' ').join('%20');
        this.position = this.convertPosition().split(' ').join('%20');
        this.experience = this.convertExperience();
        this.scope = this.convertScope();
        this.jobType = this.convertJobType();
        this.distance = this.convertDistance();
        this.hash = GeneralQuery.hashQuery(this.userInput);
    }
    static hashQuery(userInput) {
        const { distance, experience, jobType, location, position, scope } = userInput;
        const hash = (0, crypto_1.createHash)('sha1')
            .update(distance + experience + jobType + location + position + scope)
            .digest('hex');
        return hash;
    }
    convertPosition() {
        const userInput = this.userInput.position;
        return this.queryOptions.positions[userInput].he;
    }
    convertLocation() {
        const userInput = this.userInput.location;
        return this.queryOptions.locations[userInput].he;
    }
    convertExperience() {
        let yearExperienceArr = [];
        let res = '';
        const userInputSplit = this.userInput.experience.split(',');
        if (userInputSplit.length === 0)
            return '';
        if (this.scannerName === 'linkedin') {
            yearExperienceArr = userInputSplit.map((el) => {
                const expY = el;
                return this.queryOptions.experience.linkedin.f_e[expY];
            });
            res = yearExperienceArr.join('%2C');
        }
        if (this.scannerName === 'drushim') {
            yearExperienceArr = userInputSplit
                .map((el) => {
                if (el === '6')
                    return '';
                const expY = el;
                return this.queryOptions.experience.drushim.experience[expY];
            })
                .filter((el) => el);
            res = yearExperienceArr.join('-');
        }
        return res;
    }
    convertDistance() {
        let distance = '';
        const userInput = this.userInput.distance;
        if (this.scannerName === 'linkedin')
            distance = this.queryOptions.distance.linkedin.distance[userInput];
        if (this.scannerName === 'allJobs')
            distance = this.queryOptions.distance.allJobs.durations[userInput];
        if (this.scannerName === 'drushim')
            distance = this.queryOptions.distance.drushim.range[userInput];
        return distance;
    }
    convertScope() {
        return '';
    }
    convertJobType() {
        return '';
    }
}
exports.GeneralQuery = GeneralQuery;
//# sourceMappingURL=generalQuery.js.map