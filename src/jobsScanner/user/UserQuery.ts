import { createHash } from 'crypto';
import { UserQueryProps } from '../generalQuery/query.types';
import { EXPIRE_AT } from '../../../lib/contestants';
export class UserQuery {
  expireAt: number;
  userQuery: UserQueryProps;
  hash: string;

  constructor(userQuery: UserQueryProps, expireAt = EXPIRE_AT) {
    this.userQuery = userQuery;
    this.expireAt = expireAt;
    this.hash = this.getQueryHash();
  }

  getCurQueryTime() {
    return this.userQuery.createdAt.getTime();
  }

  /**
   * @returns {boolean} True, if the the diff between the current date and the createdAt is bigger than the expireAt threshold. Otherwise return false.
   */
  isUserQueryExpire(): boolean {
    if (this.expireAt <= new Date().getTime() - this.getCurQueryTime()) return true;

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
    return {
      ...this.userQuery,
      hash: this.hash,
    };
  }
}
