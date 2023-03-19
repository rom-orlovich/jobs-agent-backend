import { LOCATIONS_DICT_DB } from '../createQueryDB/locationDictDB';
import { POSITIONS_DICT_DB } from '../createQueryDB/positionDictDB';

import { SCANNER_QUERY_OPTIONS } from './scannerQueryOptions';

import { Experience, QueryOptionsResProps, ScannerName, UserQueryProps } from './query.types';
export class GeneralQuery<T extends ScannerName> implements QueryOptionsResProps {
  experience: string;
  scope: string;
  jobType: string;
  distance: string;
  position: string;
  location: string;
  queryOptions: typeof SCANNER_QUERY_OPTIONS;
  userQuery: UserQueryProps;
  scannerName: ScannerName;

  constructor(scannerName: T, userQuery: UserQueryProps) {
    this.scannerName = scannerName;
    this.queryOptions = SCANNER_QUERY_OPTIONS;
    this.userQuery = userQuery;
    this.location = encodeURIComponent(this.convertLocation());
    this.position = encodeURIComponent(this.convertPosition());
    this.experience = this.convertExperience();
    this.scope = this.convertScope();
    this.jobType = this.convertJobType();
    this.distance = this.convertDistance();
  }

  isQueryValid() {
    return this.location && this.position;
  }

  protected convertPosition(): string {
    const userQuery = this.userQuery.position as keyof typeof POSITIONS_DICT_DB;
    return this.queryOptions.positions[userQuery]?.he || '';
  }
  protected convertLocation(): string {
    const userQuery = this.userQuery.location as keyof typeof LOCATIONS_DICT_DB;
    return this.queryOptions.locations[userQuery]?.he || '';
  }

  protected convertExperience() {
    let yearExperienceArr: string[] = [];
    let res = '';
    const userQuerySplit = this.userQuery.experience.split(',');
    if (userQuerySplit.length === 0) return '';
    if (this.scannerName === 'linkedin') {
      yearExperienceArr = userQuerySplit.map((el) => {
        const expY = el as Experience<'linkedin'>;
        return this.queryOptions.experience.linkedin.f_e[expY];
      });
      res = yearExperienceArr.join('%2C');
    }

    if (this.scannerName === 'drushim') {
      yearExperienceArr = userQuerySplit
        .map((el) => {
          if (el === '6') return '';
          const expY = el as Experience<'drushim'>;

          return this.queryOptions.experience.drushim.experience[expY];
        })
        .filter((el) => el);
      res = yearExperienceArr.join('-');
    }
    return res;
  }

  protected convertDistance(): string {
    let distance = '';
    const userQuery = this.userQuery.distance;
    if (this.scannerName === 'linkedin')
      distance = this.queryOptions.distance.linkedin.distance[userQuery];
    if (this.scannerName === 'allJobs')
      distance = this.queryOptions.distance.allJobs.durations[userQuery];
    if (this.scannerName === 'drushim') distance = this.queryOptions.distance.drushim.range[userQuery];
    return distance;
  }

  protected convertScope() {
    return '';
  }

  protected convertJobType(): string {
    return '';
  }
}
