import { LOCATIONS_DICT_DB } from '../../createQueryDB/locationDictDB';
import { GeneralQuery } from '../../generalQuery/generalQuery';
import { JobType, Scope, UserQueryProps } from '../../generalQuery/query.types';

export class AllJobsQueryOptions extends GeneralQuery<'allJobs'> {
  constructor(userQuery: UserQueryProps) {
    super('allJobs', userQuery);
  }
  protected convertLocation(): string {
    const userQuery = this.userQuery.location as keyof typeof LOCATIONS_DICT_DB;
    const location = this.queryOptions.locations[userQuery];
    return location?.source ? String(location?.source) : '';
  }
  protected convertJobType(): string {
    const userQuerySplitJobType = this.userQuery.jobType.split(',');

    const jobTypeArr = userQuerySplitJobType.map((el) => {
      const jobType = el as JobType<'allJobs'>;
      if (jobType === '2') return this.queryOptions.jobType.allJobs['type'][2].region;
      return this.queryOptions.jobType.allJobs.type[jobType];
    });

    const userQuerySplitScope = this.userQuery.jobType.split(',');
    const jobScopeArr = userQuerySplitScope.map((el) => {
      const scope = el as Scope<'allJobs'>;
      return this.queryOptions.scope.allJobs.type[scope];
    });

    return [...jobTypeArr, ...jobScopeArr].filter((el) => el).join(',');
  }
  protected convertScope(): string {
    return '';
  }
}
