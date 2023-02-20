export const EXPIRE_AT = Number(process.env.EXPIRE_AT) * 1000 * 60 * 60;
export const EXPIRE_AT_MONGO_DB = EXPIRE_AT / 1000;

export class HashQuery {
  hash: string;
  createdAt: Date;
  expireAt: number;
  constructor(hash: string, createdAt = new Date(), expireAt = EXPIRE_AT) {
    this.hash = hash;
    this.createdAt = createdAt;
    this.expireAt = expireAt;
  }
  isHashExpire() {
    if (this.createdAt.getMilliseconds() + this.expireAt === new Date().getMilliseconds()) return true;
    return false;
  }
  updateHashCreatedAt() {
    this.createdAt = new Date();
  }
}
