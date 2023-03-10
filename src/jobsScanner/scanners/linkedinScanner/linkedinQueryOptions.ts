import { LOCATIONS_DICT_DB } from '../../createQueryDB/locationDictDB';
import { POSITIONS_DICT_DB } from '../../createQueryDB/positionDictDB';
import { GeneralQuery } from '../../generalQuery/generalQuery';
import { JobType, Scope, UserQueryProps } from '../../generalQuery/query.types';

const PERIOD = {
  'past month': 'r2592000',
  'past week': 'r604800',
  '24hr': 'r86400',
} as const;

export const BLACK_LIST_WORDS = ['Angular', 'Senior', 'Lead'];

const SORT_BY = {
  relevant: 'R',
  recent: 'DD',
} as const;

export class LinkedinQueryOptions extends GeneralQuery<'linkedin'> {
  period: string;
  sortBy: string;

  constructor(userQuery: UserQueryProps) {
    super('linkedin', userQuery);
    this.period = this.convertPeriod();
    this.sortBy = this.convertSortBy();
  }
  protected convertLocation(): string {
    const userQuery = this.userQuery.location as keyof typeof LOCATIONS_DICT_DB;

    return this.queryOptions.locations[userQuery]?.en || '';
  }

  protected convertScope() {
    let scopesArr: string[] = [];
    if (!this.userQuery.scope) return '';
    const userQuerySplit = this.userQuery.scope.split(',');

    scopesArr = userQuerySplit.map((el) => {
      const scope = el as Scope<'linkedin'>;
      return this.queryOptions.scope.linkedin.f_JT[scope];
    });

    return scopesArr.join('%2C');
  }

  protected convertJobType(): string {
    let jobTypeArr: string[] = [];
    if (!this.userQuery.jobType) return '';
    const userQuerySplit = this.userQuery.jobType.split(',');

    jobTypeArr = userQuerySplit.map((el) => {
      const jobType = el as JobType<'linkedin'>;
      return this.queryOptions.jobType.linkedin.f_WT[jobType];
    });

    return jobTypeArr.join('%2C');
  }

  protected convertPosition(): string {
    const userQuery = this.userQuery.position as keyof typeof POSITIONS_DICT_DB;
    return this.queryOptions.positions[userQuery]?.en || '';
  }
  protected convertPeriod(period: keyof typeof PERIOD = 'past week') {
    return PERIOD[period];
  }
  protected convertSortBy(sortBy: keyof typeof SORT_BY = 'relevant') {
    return SORT_BY[sortBy];
  }
}
