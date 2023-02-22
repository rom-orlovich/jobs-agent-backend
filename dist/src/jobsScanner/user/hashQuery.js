"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashQuery = exports.EXPIRE_AT_MONGO_DB = exports.EXPIRE_AT = void 0;
exports.EXPIRE_AT = Number(process.env.EXPIRE_AT) * 1000 * 60 * 60;
exports.EXPIRE_AT_MONGO_DB = exports.EXPIRE_AT / 1000;
class HashQuery {
    constructor(hash, createdAt = new Date(), expireAt = exports.EXPIRE_AT) {
        this.hash = hash;
        this.createdAt = createdAt;
        this.expireAt = expireAt;
    }
    isHashExpire() {
        if (this.createdAt.getMilliseconds() + this.expireAt === new Date().getMilliseconds())
            return true;
        return false;
    }
    updateHashCreatedAt() {
        this.createdAt = new Date();
    }
}
exports.HashQuery = HashQuery;
//# sourceMappingURL=hashQuery.js.map