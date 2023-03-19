import { LOCATIONS_DICT_DB } from '../../createQueryDB/locationDictDB';
import { GeneralQuery } from '../../generalQuery/generalQuery';
import { JobType, Scope, UserQueryProps } from '../../generalQuery/query.types';

export class DrushimQueryOptions extends GeneralQuery<'drushim'> {
  constructor(userQuery: UserQueryProps) {
    super('drushim', userQuery);
  }

  protected convertLocation(): string {
    const locationName = this.userQuery.location as keyof typeof LOCATIONS_DICT_DB;
    return this.queryOptions.locations[locationName]?.geolexid || '';
  }

  private getScopeStr() {
    if (!this.userQuery.scope) return '';
    const userQuerySplit = this.userQuery.scope.split(',');

    const scopesArr = userQuerySplit.map((el: string) => {
      const scope = el as Scope<'drushim'>;
      return this.queryOptions.scope.drushim.scope[scope];
    });

    const scopesStr = scopesArr.join('-');
    return scopesStr;
  }

  private getJobType() {
    const jobType = this.userQuery.jobType as JobType<'drushim'>;
    const jobTypeRes = this.queryOptions.jobType.drushim.scope[jobType] || '';
    return jobTypeRes;
  }

  protected convertScope(): string {
    const userQuerySplit = this.userQuery.scope.split(',');
    if (userQuerySplit.length === 0) return '';
    const scopeStr = this.getScopeStr();
    const jobTypeRes = this.getJobType();
    return `${scopeStr}${jobTypeRes ? `-${jobTypeRes}` : ''}`;
  }

  protected convertJobType(): string {
    return '';
  }
}
