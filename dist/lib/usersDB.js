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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersDB = void 0;
const server_1 = require("../src/server");
const user_1 = require("../src/jobsScanner/user/user");
class UsersDB {
    constructor() {
        this.users = server_1.mongoDB.createDBcollection('jobs-agent-db', 'users');
    }
    addUser({ hashQueries, blackList, excludedRequirements, requirements, overallEx, }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.users.insertOne({
                    hashQueries,
                    blackList,
                    excludedRequirements,
                    requirements,
                    overallEx,
                });
                return result;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    loadUser(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.users.findOne({
                    userID: userID,
                });
                if (!result)
                    return undefined;
                const user = new user_1.User(result);
                return user;
            }
            catch (error) {
                console.log(error);
                return undefined;
            }
        });
    }
    updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.users.updateOne({
                    userID: user.userID,
                }, { $set: Object.assign({}, user) });
                if (!result)
                    return undefined;
                return result.modifiedCount;
            }
            catch (error) {
                return undefined;
            }
        });
    }
}
exports.UsersDB = UsersDB;
//# sourceMappingURL=usersDB.js.map