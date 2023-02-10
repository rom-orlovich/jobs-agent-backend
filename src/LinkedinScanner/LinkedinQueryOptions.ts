import { LOCATIONS_DICT_DB } from '../createQueryDB/locationDB';
import { POSITIONS_DICT_DB } from '../createQueryDB/positionDictDB';
import { GeneralQuery, UserInput } from '../GeneralQuery';

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

  constructor(userInput: UserInput) {
    super('linkedin', userInput);
    this.period = this.convertPeriod();
    this.sortBy = this.convertSortBy();
  }
  protected convertLocation(): string {
    const userInput = this.userInput.location as keyof typeof LOCATIONS_DICT_DB;

    return this.queryOptions.locations[userInput].en;
  }

  protected convertPosition(): string {
    const userInput = this.userInput.position as keyof typeof POSITIONS_DICT_DB;
    return this.queryOptions.positions[userInput].en;
  }
  protected convertPeriod(period: keyof typeof PERIOD = 'past month') {
    return PERIOD[period];
  }
  protected convertSortBy(sortBy: keyof typeof SORT_BY = 'relevant') {
    return SORT_BY[sortBy];
  }

  // protected convertPosition() {
  //   const positionDict = this.queryOptions.positions[
  //     this.userInput.position as ScannerPositionsNames
  //   ] as { en: string; he: string };
  //   if (!positionDict) return this.userInput.position;
  //   return positionDict.en.split(' ').join('+');
  // }
  // protected convertLocation() {
  //   const locationDict =
  //     this.queryOptions.locations[this.userInput.location as ScannerLocationsNames].en;
  //   if (!locationDict) return this.userInput.location;
  //   return locationDict.split(' ').join('%20');
  // }

  // protected convertScope() {
  //   const scopesArr = this.userInput.scope.split(',').map((el) => {
  //     const scope = el as keyof ScannerScopeKeysValue;
  //     return this.queryOptions.scope.linkedin.f_JT[scope];
  //   });

  //   return scopesArr.join(',');
  // }
  // protected convertType() {
  //   const scopesArr = this.userInput.scope.split(',').map((el) => {
  //     const scope = el as keyof ScannerJobTypeKeysValue;
  //     return this.queryOptions.scope.linkedin.f_JT[scope];
  //   });

  //   return scopesArr.join(',');
  // }

  // protected convertExperience() {
  //   const yearExperienceArr = this.userInput.experience.split(',').map((el) => {
  //     const expY = el as keyof ScannerExperienceKeysValue;
  //     return this.queryOptions.exp.linkedin.f_e[expY];
  //   });
  //   return yearExperienceArr.join(',');
  // }

  // protected convertDistance() {
  //   return this.queryOptions.distance.linkedin.distance[this.userInput.distance];
  // }
}
