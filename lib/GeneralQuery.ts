import { LOCATIONS_DICT_DB } from '../sandbox/locationDB';
import { POSITIONS_DICT_DB } from '../sandbox/positionDictDB';
import { BLACK_LIST_WORDS } from './LinkedinQueryOptions';
import { ExtractKey, OmitKey, PickKey } from './types/types';

export interface UserInput {
  location: keyof typeof LOCATIONS_DICT_DB;
  position: keyof typeof POSITIONS_DICT_DB;
  distance: '1' | '2' | '3';
  jobType: string;
  scope: string;
  experience: string;
  blackList: string[];
}

const SCANNER_QUERY_OPTIONS = {
  exp: {
    linkedin: {
      f_e: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
      },
    },
    gotFriends: undefined,
    allJobs: undefined,
    drushim: { experience: { '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' } },
  },
  scope: {
    linkedin: { f_JT: { '1': 'F', '2': 'P' } },
    gotFriends: undefined,
    allJobs: { type: { '1': '4', '2': '5' } },
    drushim: { scope: { '1': '1', '2': '2' } },
  },
  jobType: {
    linkedin: { f_WT: { '1': '3', '2': '2', '3': '1' } },
    gotFriends: undefined,
    allJobs: { type: { '1': '37', '2': { region: '11' }, '3': '' } },
    drushim: { scope: { '2': '5' } },
  },
  distance: {
    linkedin: { distance: { '1': '10', '2': '25', '3': '50' } },
    gotFriends: undefined,
    allJobs: { durations: { '1': '10', '2': '25', '3': '50' } },
    drushim: { range: { '1': '2', '2': '3', '3': '4' } },
  },
  positions: POSITIONS_DICT_DB,
  locations: LOCATIONS_DICT_DB,
};

export type ScannerName = 'linkedin' | 'gotFriends' | 'allJobs' | 'drushim';

export interface GeneralQueryProps<T extends ScannerName> {
  exp: Record<T, (typeof SCANNER_QUERY_OPTIONS)['exp'][T]>;
  scope: Record<T, (typeof SCANNER_QUERY_OPTIONS)['scope'][T]>;
  type: Record<T, (typeof SCANNER_QUERY_OPTIONS)['jobType'][T]>;
  distance: Record<T, (typeof SCANNER_QUERY_OPTIONS)['distance'][T]>;
  positions: typeof POSITIONS_DICT_DB;
  locations: typeof LOCATIONS_DICT_DB;
}

export type GeneralQueryExp<T extends ScannerName> =
  keyof GeneralQueryProps<T>['exp'][T][keyof GeneralQueryProps<T>['exp'][T]];
export type GeneralQueryScope<T extends ScannerName> =
  keyof GeneralQueryProps<T>['scope'][T][keyof GeneralQueryProps<T>['scope'][T]];
export type GeneralQueryJobType<T extends ScannerName> =
  keyof GeneralQueryProps<T>['type'][T][keyof GeneralQueryProps<T>['type'][T]];
export type GeneralQueryDistance<T extends ScannerName> =
  keyof GeneralQueryProps<T>['distance'][T][keyof GeneralQueryProps<T>['distance'][T]];

export interface QueryOptionsProps {
  exp: string;
  scope: string;
  jobType: string;
  distance: string;
  position: string;
  location: string;
}

export class GeneralQuery<T extends ScannerName> implements QueryOptionsProps {
  exp: string;
  scope: string;
  jobType: string;
  distance: string;
  position: string;
  location: string;

  queryOptions: typeof SCANNER_QUERY_OPTIONS;
  userInput: UserInput;
  scannerName: ScannerName;
  constructor(scannerName: T, UserInput: UserInput) {
    this.scannerName = scannerName;
    this.queryOptions = SCANNER_QUERY_OPTIONS;
    this.userInput = UserInput;
    this.location = this.convertLocation().split(' ').join('%20');
    this.position = this.convertPosition().split(' ').join('%20');
    this.exp = this.convertExperience();
    this.scope = this.convertScope();
    this.jobType = this.convertJobType();
    this.distance = this.convertDistance();
  }

  protected convertPosition(): string {
    const userInput = this.userInput.position as keyof typeof POSITIONS_DICT_DB;
    return this.queryOptions.positions[userInput].he;
  }
  protected convertLocation(): string {
    const userInput = this.userInput.location as keyof typeof LOCATIONS_DICT_DB;
    return this.queryOptions.locations[userInput].he;
  }

  protected convertExperience() {
    let yearExperienceArr: string[] = [];

    const userInputSplit = this.userInput.experience.split(',');
    if (userInputSplit.length === 0) return '';
    if (this.scannerName === 'linkedin') {
      yearExperienceArr = userInputSplit.map((el) => {
        const expY = el as GeneralQueryExp<'linkedin'>;
        return this.queryOptions.exp.linkedin.f_e[expY];
      });
    }

    if (this.scannerName === 'drushim') {
      yearExperienceArr = userInputSplit.map((el) => {
        const expY = el as GeneralQueryExp<'drushim'>;
        return this.queryOptions.exp.drushim.experience[expY];
      });
    }
    return this.scannerName === 'drushim' ? yearExperienceArr.join('-') : yearExperienceArr.join(',');
  }

  protected convertScope() {
    let scopesArr: string[] = [];
    const userInputSplit = this.userInput.scope.split(',');
    if (userInputSplit.length === 0) return '';

    scopesArr = userInputSplit.map((el) => {
      const scope = el as GeneralQueryScope<'linkedin'>;
      return this.queryOptions.scope.linkedin.f_JT[scope];
    });

    return scopesArr.join(',');
  }

  protected convertJobType(): string {
    let jobTypeArr: string[] = [];

    const userInputSplit = this.userInput.jobType.split(',');
    if (userInputSplit.length === 0) return '';

    jobTypeArr = userInputSplit.map((el) => {
      const jobType = el as GeneralQueryJobType<'linkedin'>;
      return this.queryOptions.jobType.linkedin.f_WT[jobType];
    });

    return jobTypeArr.join(',');
  }

  protected convertDistance(): string {
    let distance = '';
    const userInput = this.userInput.distance;
    if (this.scannerName === 'linkedin')
      distance = this.queryOptions.distance.linkedin.distance[userInput];
    if (this.scannerName === 'allJobs')
      distance = this.queryOptions.distance.allJobs.durations[userInput];
    if (this.scannerName === 'drushim') distance = this.queryOptions.distance.drushim.range[userInput];
    return distance;
  }

  checkWordInBlackList(word: string) {
    return (
      this.userInput.blackList?.length &&
      this.userInput.blackList?.some((bl) => {
        return word.toLowerCase().includes(bl.toLowerCase());
      })
    );
  }
}
