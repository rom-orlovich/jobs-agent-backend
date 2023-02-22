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
exports.MongoDBClient = void 0;
const mongodb_1 = require("mongodb");
class MongoDBClient {
    constructor() {
        this.client = new mongodb_1.MongoClient(process.env.MONGO_DB_URI || 'mongodb://localhost:27017');
        this.DBMap = {};
        this.collectionsMap = {};
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.connect();
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.close();
        });
    }
    getClient() {
        return this.client;
    }
    createDBcollection(dbName, collectionName) {
        return this.client.db(dbName).collection(collectionName);
    }
    createCollection(dbName, collectionName) {
        const db = this.getDB(dbName);
        this.collectionsMap.collectionName = db.collection(collectionName);
        return this.collectionsMap.collectionName;
    }
    getDB(dbName) {
        return this.DBMap[dbName];
    }
    getCollection(collectionName) {
        return this.collectionsMap[collectionName];
    }
}
exports.MongoDBClient = MongoDBClient;
//# sourceMappingURL=mongoClient.js.map