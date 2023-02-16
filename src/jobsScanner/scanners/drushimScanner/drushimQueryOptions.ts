import { LOCATIONS_DICT_DB } from '../../createQueryDB/locationDB';
import { GeneralQuery } from '../../generalQuery/generalQuery';
import { JobType, Scope, UserQuery } from '../../generalQuery/query';

export class DrushimQueryOptions extends GeneralQuery<'drushim'> {
  constructor(userInput: UserQuery) {
    super('drushim', userInput);
  }

  protected convertLocation(): string {
    const userInput = this.userInput.location as keyof typeof LOCATIONS_DICT_DB;
    return this.queryOptions.locations[userInput].geolexid;
  }

  private getScopeStr() {
    if (!this.userInput.scope) return '';
    const userInputSplit = this.userInput.scope.split(',');

    const scopesArr = userInputSplit.map((el) => {
      const scope = el as Scope<'drushim'>;
      return this.queryOptions.scope.drushim.scope[scope];
    });
    const scopesStr = scopesArr.join('-');
    return scopesStr;
  }

  private getJobType() {
    const jobType = this.userInput.jobType as JobType<'drushim'>;
    const jobTypeRes = this.queryOptions.jobType.drushim.scope[jobType] || '';
    return jobTypeRes;
  }

  protected convertScope(): string {
    const userInputSplit = this.userInput.scope.split(',');
    if (userInputSplit.length === 0) return '';
    const scopeStr = this.getScopeStr();
    const jobTypeRes = this.getJobType();
    return `${scopeStr}${jobTypeRes ? `-${jobTypeRes}` : ''}`;
  }

  protected convertJobType(): string {
    return '';
  }
}
