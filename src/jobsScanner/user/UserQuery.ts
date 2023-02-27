export const EXPIRE_AT =
  process.env.NODE_ENV === 'test' ? 1000 * 60 : Number(process.env.EXPIRE_AT) * 1000 * 60 * 60;

export const EXPIRE_AT_MONGO_DB = EXPIRE_AT / 1000;
import { createHash } from 'crypto';
import { UserQueryProps } from '../generalQuery/query.types';
export class UserQuery {
  expireAt: number;
  userQuery: UserQueryProps;
  hash: string;
  constructor(userQuery: UserQueryProps, expireAt = EXPIRE_AT) {
    this.userQuery = userQuery;
    this.expireAt = expireAt;
    this.hash = this.getQueryHash();
  }

  /**
   * @returns {boolean} True, if the the diff between the current date and the createdAt is bigger than the expireAt threshold. Otherwise return false.
   */
  isUserQueryExpire(): boolean {
    if (this.expireAt <= new Date().getTime() - this.userQuery.createdAt.getTime()) return true;

    return false;
  }

  /**
   * @returns {string} The current hash query.
   */
  getQueryHash(): string {
    if (this.userQuery?.hash) return this.userQuery.hash;
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
    return { ...this.userQuery, hash: this.hash };
  }
}
