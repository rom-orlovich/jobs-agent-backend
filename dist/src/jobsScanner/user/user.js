"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const hashQuery_1 = require("./hashQuery");
const generalQuery_1 = require("../generalQuery/generalQuery");
/**
 * @param excludedRequirements An object that contains the tech stack which the user doesn't want to include the in jobs list.
 * @param requirements An object that contains the min and max years of experience per each of the user.
 * @param overallEx A number that present the overall experience of the user.
 */
class User {
    constructor(userOptions) {
        this.userID = userOptions._id;
        this.overallEx = userOptions.overallEx;
        this.requirements = this.setRequirements(userOptions.requirements);
        this.excludedRequirements = this.setExcludedRequirements(userOptions.excludedRequirements);
        this.blackList = userOptions.blackList;
        this.userQuery = userOptions.userQuery;
        this.hashQueries = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.hashQueries) || [];
        this.loadCurrentHashQuery();
        this.addCurrentHashQuery();
    }
    filterExpiredHashQueries() {
        this.hashQueries = this.hashQueries.filter((hashQuery) => !hashQuery.isHashExpire());
    }
    /**
     * Load the current user's hashQueries from the DB to hash query instance.
     */
    loadCurrentHashQuery() {
        this.hashQueries = this.hashQueries.map((el) => new hashQuery_1.HashQuery(el.hash, el.createdAt));
        this.filterExpiredHashQueries();
        this.addCurrentHashQuery();
    }
    /**
     * @returns The current user's hashQuery.
     */
    getCurrentHashQuery() {
        return generalQuery_1.GeneralQuery.hashQuery(this.userQuery);
    }
    addHashQuery(hash) {
        this.hashQueries.push(new hashQuery_1.HashQuery(hash));
    }
    addCurrentHashQuery() {
        const hash = this.getCurrentHashQuery();
        const hashQuery = this.hashQueries.find((hashQuery) => hashQuery.hash === hash);
        if (!hashQuery)
            this.addHashQuery(hash);
    }
    setRequirements(requirementsOptions) {
        return new Map(Object.entries(requirementsOptions));
    }
    setExcludedRequirements(excludedRequirements) {
        return new Map(Object.entries(excludedRequirements));
    }
    getRequirement(tech) {
        return this.requirements.get(tech);
    }
    getExcludedRequirement(tech) {
        return this.excludedRequirements.get(tech);
    }
    checkWordInBlackList(word) {
        var _a, _b;
        return (((_a = this.blackList) === null || _a === void 0 ? void 0 : _a.length) &&
            ((_b = this.blackList) === null || _b === void 0 ? void 0 : _b.some((bl) => {
                return word.toLowerCase().includes(bl.toLowerCase());
            })));
    }
    /**
     * @returns {string[]} The current user's hashQueries array.
     */
    getCurrentHashQueries() {
        return this.hashQueries.map((el) => el.hash);
    }
    updateHashCreatedAt(hash) {
        const hashQuery = this.hashQueries.find((hashQuery) => hashQuery.hash === hash);
        if (hashQuery)
            hashQuery.updateHashCreatedAt();
    }
    isUserQueryActive() {
        return this.userQuery.active;
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map