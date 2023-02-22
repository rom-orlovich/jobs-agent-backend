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
exports.validateBeforeScanner = void 0;
const usersDB_1 = require("../../lib/usersDB");
// Check the userID is valid number.
const checkUserIDisNumber = (userID) => {
    if (typeof userID !== 'string')
        return undefined;
    const userIDisNumber = Number.parseInt(userID);
    if (userIDisNumber)
        return userID;
};
//Check the activeQuery is valid boolean.
const checkActiveQueryIsBoolean = (activeQuery) => {
    if (typeof activeQuery !== 'string')
        return undefined;
    const activeQueryObj = {
        true: true,
        false: false,
    };
    return activeQueryObj[activeQuery];
};
//initial the usersDB and load the requested user from the DB.
const initialUsersAndLoadUserFromDB = (userID) => __awaiter(void 0, void 0, void 0, function* () {
    const usersDB = new usersDB_1.UsersDB();
    const user = yield usersDB.loadUser(userID);
    return { usersDB, user };
});
const validateBeforeScanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Check the userID is valid number.
    const userID = checkUserIDisNumber(req.params.userID);
    if (!userID)
        return res.status(400).send({ message: 'Please enter a valid userID' });
    //Check the activeQuery is valid.
    const activeQuery = checkActiveQueryIsBoolean(req.query.activeQuery);
    if (activeQuery === undefined)
        return res.status(400).send({ message: 'Please enter a valid active query' });
    //initial the usersDB and load the requested user from the DB.
    const { user, usersDB } = yield initialUsersAndLoadUserFromDB(userID);
    if (!user)
        return res.status(400);
    req.validateBeforeScanner = {
        user,
        usersDB,
        activeQuery: activeQuery,
    };
    next();
});
exports.validateBeforeScanner = validateBeforeScanner;
//# sourceMappingURL=middleware.js.map