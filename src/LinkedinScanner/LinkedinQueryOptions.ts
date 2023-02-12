import { LOCATIONS_DICT_DB } from '../createQueryDB/locationDB';
import { POSITIONS_DICT_DB } from '../createQueryDB/positionDictDB';
import { GeneralQuery } from '../GeneralQuery/GeneralQuery';
import { UserInput } from '../GeneralQuery/generalQuery';

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
}
