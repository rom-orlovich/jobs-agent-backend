"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GotFriendQueryOptions = void 0;
const generalQuery_1 = require("../../generalQuery/generalQuery");
class GotFriendQueryOptions extends generalQuery_1.GeneralQuery {
    constructor(userInput) {
        super('gotFriends', userInput);
        const { checkboxProfessions, radioAreas } = this.convertPositionGotFriends();
        this.checkboxProfessions = checkboxProfessions;
        this.radioAreas = radioAreas;
    }
    convertPositionGotFriends() {
        var _a;
        const userInput = this.userInput.position;
        return (((_a = this.queryOptions.positions[userInput]) === null || _a === void 0 ? void 0 : _a.gotFriends) || {
            checkboxProfessions: '',
            radioAreas: '',
        });
    }
    convertLocation() {
        var _a;
        const userInput = this.userInput.location;
        return ((_a = this.queryOptions.locations[userInput]) === null || _a === void 0 ? void 0 : _a.checkboxRegions) || '';
    }
    convertPosition() {
        return '';
    }
    convertJobType() {
        return '';
    }
    convertScope() {
        return '';
    }
}
exports.GotFriendQueryOptions = GotFriendQueryOptions;
//# sourceMappingURL=gotFriendsQuery.js.map