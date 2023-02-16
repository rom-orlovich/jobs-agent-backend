import { LOCATIONS_DICT_DB } from '../../createQueryDB/locationDB';
import { GeneralQuery } from '../../generalQuery/generalQuery';
import { JobType, Scope, UserQuery } from '../../generalQuery/query';

export class AllJobsQueryOptions extends GeneralQuery<'allJobs'> {
  constructor(userInput: UserQuery) {
    super('allJobs', userInput);
  }
  protected convertLocation(): string {
    const userInput = this.userInput.location as keyof typeof LOCATIONS_DICT_DB;
    return String(this.queryOptions.locations[userInput].source);
  }
  protected convertJobType(): string {
    const userInputSplitJobType = this.userInput.jobType.split(',');

    const jobTypeArr = userInputSplitJobType.map((el) => {
      const jobType = el as JobType<'allJobs'>;
      if (jobType === '2') return this.queryOptions.jobType.allJobs['type'][2].region;
      return this.queryOptions.jobType.allJobs.type[jobType];
    });

    const userInputSplitScope = this.userInput.jobType.split(',');
    const jobScopeArr = userInputSplitScope.map((el) => {
      const scope = el as Scope<'allJobs'>;
      return this.queryOptions.scope.allJobs.type[scope];
    });

    return [...jobTypeArr, ...jobScopeArr].filter((el) => el).join(',');
  }
  protected convertScope(): string {
    return '';
  }
}
