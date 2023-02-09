import { LOCATIONS_DB } from '../sandbox/locationDB';
import { POSITIONS_DICT_NAME } from '../sandbox/positionDictDB';
import { BLACK_LIST_WORDS } from './LinkedinQueryOptions';
import { ExtractKey, OmitKey, PickKey } from './types/types';

export interface UserInput {
  location: string;
  position: string;
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
        '2': ' 2',
        '3': ' 3',
        '4': '4',
        '5': ' 5',
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
    drushim: { scope: { '2': '5', '1': '', '3': '' } },
  },
  distance: {
    linkedin: { distance: { '1': '10', '2': '25', '3': '50' } },
    gotFriends: undefined,
    allJobs: { durations: { '1': '10', '2': '25', '3': '50' } },
    drushim: { range: { '1': '2', '2': '3', '3': '4' } },
  },
  positions: POSITIONS_DICT_NAME,
  locations: LOCATIONS_DB,
};

// export type ScannerPositionsNames = keyof (typeof SCANNER_QUERY_OPTIONS)['positions'];
// export type ScannerLocationsNames = keyof (typeof SCANNER_QUERY_OPTIONS)['locations'];
// export type ScannerExperience = keyof (typeof SCANNER_QUERY_OPTIONS)['exp'];
// export type ScannerExperienceKeysValue = (typeof SCANNER_QUERY_OPTIONS)['exp'][ScannerExperience];
// export type ScannerScope = keyof (typeof SCANNER_QUERY_OPTIONS)['scope'];
// export type ScannerScopeKeysValue = (typeof SCANNER_QUERY_OPTIONS)['scope'][ScannerScope];
// export type ScannerJobType = keyof (typeof SCANNER_QUERY_OPTIONS)['type'];
// export type ScannerJobTypeKeysValue = (typeof SCANNER_QUERY_OPTIONS)['type'][ScannerJobType];

export type ScannerName = 'linkedin' | 'gotFriends' | 'allJobs' | 'drushim';

export interface GeneralQueryProps<T extends ScannerName> {
  exp: Record<T, (typeof SCANNER_QUERY_OPTIONS)['exp'][T]>;
  scope: Record<T, (typeof SCANNER_QUERY_OPTIONS)['scope'][T]>;
  type: Record<T, (typeof SCANNER_QUERY_OPTIONS)['jobType'][T]>;
  distance: Record<T, (typeof SCANNER_QUERY_OPTIONS)['distance'][T]>;
  positions: typeof POSITIONS_DICT_NAME;
  locations: typeof LOCATIONS_DB;
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
  type: string;
  distance: string;
  position: string;
  location: string;
}

export class GeneralQuery<T extends ScannerName> implements QueryOptionsProps {
  exp: string;
  scope: string;
  type: string;
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
    this.location = this.convertLocation();
    this.position = this.convertPosition();
    this.exp = this.convertExperience();
    this.scope = this.convertScope();
    this.type = this.convertJobType();
    this.distance = this.convertDistance();
  }

  protected convertPosition(): string {
    const userInput = this.userInput.position as keyof typeof POSITIONS_DICT_NAME;
    return this.queryOptions.positions[userInput].he;
  }
  protected convertLocation(): string {
    const userInput = this.userInput.position as keyof typeof LOCATIONS_DB;
    return this.queryOptions.positions[userInput].he;
  }

  protected convertExperience() {
    let yearExperienceArr: string[] = [];
    const userInputSplit = this.userInput.jobType.split(',');
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
    const userInputSplit = this.userInput.jobType.split(',');
    if (this.scannerName === 'linkedin')
      scopesArr = userInputSplit.map((el) => {
        const scope = el as GeneralQueryScope<'linkedin'>;
        return this.queryOptions.scope.linkedin.f_JT[scope];
      });

    if (this.scannerName === 'allJobs') {
      scopesArr = userInputSplit.map((el) => {
        const scope = el as GeneralQueryScope<'allJobs'>;
        return this.queryOptions.scope.allJobs.type[scope];
      });
    }
    if (this.scannerName === 'drushim')
      scopesArr = userInputSplit.map((el) => {
        const scope = el as GeneralQueryScope<'drushim'>;
        return this.queryOptions.scope.drushim.scope[scope];
      });

    return this.scannerName === 'drushim' ? scopesArr.join('-') : scopesArr.join(',');
  }

  protected convertJobType(): string {
    let jobTypeArr: string[] = [];

    const userInputSplit = this.userInput.jobType.split(',');
    if (this.scannerName === 'linkedin')
      jobTypeArr = userInputSplit.map((el) => {
        const jobType = el as GeneralQueryJobType<typeof this.scannerName>;
        return this.queryOptions.jobType.linkedin.f_WT[jobType];
      });

    if (this.scannerName === 'allJobs') {
      jobTypeArr = userInputSplit.map((el) => {
        const jobType = el as GeneralQueryJobType<typeof this.scannerName>;
        if (jobType === '2') return '';
        return this.queryOptions.jobType.allJobs.type[jobType];
      });
    }
    if (this.scannerName === 'drushim')
      jobTypeArr = userInputSplit.map((el) => {
        const jobType = el as GeneralQueryJobType<typeof this.scannerName>;
        return this.queryOptions.jobType.drushim.scope[jobType];
      });

    return this.scannerName === 'drushim' ? jobTypeArr.join('-') : jobTypeArr.join(',');
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

  // protected convertScope(): string {
  //   throw new Error('Method not implemented.');
  // }

  // protected convertExperience(): string {
  //   throw new Error('Method not implemented.');
  // }

  checkWordInBlackList(word: string) {
    return (
      this.userInput.blackList?.length &&
      this.userInput.blackList?.some((bl) => {
        return word.toLowerCase().includes(bl.toLowerCase());
      })
    );
  }
}
