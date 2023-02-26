export const EXPIRE_AT = Number(process.env.EXPIRE_AT) * 1000 * 60 * 60;
export const EXPIRE_AT_MONGO_DB = EXPIRE_AT / 1000;
import { createHash } from 'crypto';
import { UserQueryProps } from '../generalQuery/query.types';
export class UserQuery {
  createdAt: Date;
  expireAt: number;
  userQuery: UserQueryProps;
  hash: string;
  constructor(userQuery: UserQueryProps, createdAt = new Date(), expireAt = EXPIRE_AT) {
    this.userQuery = userQuery;
    this.createdAt = createdAt;
    this.expireAt = expireAt;
    this.hash = this.getQueryHash();
  }

  isUserQueryExpire() {
    if (this.createdAt.getMilliseconds() + this.expireAt === new Date().getMilliseconds()) return true;
    return false;
  }

  /**
   *
   * @returns {string} The current hash query.
   */
  getQueryHash(): string {
    // if (this.userQuery?.hash) return this.userQuery.hash;
    const { distance, experience, jobType, location, position, scope } = this.userQuery;
    const hash = createHash('sha1')
      .update(distance + experience + jobType + location + position + scope)
      .digest('hex');
    return hash;
  }

  /**
   *
   * @returns {UserQueryProps} convert back to userQueryProps with curHash.
   */
  getUserQueryProps(): UserQueryProps {
    return { ...this.userQuery, createdAt: this.createdAt, hash: this.hash };
  }
}
