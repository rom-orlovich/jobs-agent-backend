import { LOCATIONS_DB } from '../sandbox/locationDB';
import { POSITIONS_DICT_NAME } from '../sandbox/positionDictDB';
import { BLACK_LIST_WORDS } from './LinkedinQueryOptions';

export interface UserInput {
  location: string;
  position: string;
  distance: '1' | '2' | '3';
  type: string;
  scope: string;
  experience: string;
  blackList: string[];
}

const SCANNER_QUERY_OPTIONS = {
  exp: {
    linkedin: {
      f_e: {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
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
  type: {
    linkedin: { f_WT: { '1': '3', '2': '2', '3': '1' } },
    gotFriends: undefined,
    allJobs: { type: { '1': '37', '2': { region: '11' }, '3': undefined } },
    drushim: { scope: { '2': '5', '1': undefined, '3': undefined } },
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

export type ScannerPositionsNames = keyof (typeof SCANNER_QUERY_OPTIONS)['positions'];
export type ScannerLocationsNames = keyof (typeof SCANNER_QUERY_OPTIONS)['locations'];
export type ScannerExperience = keyof (typeof SCANNER_QUERY_OPTIONS)['exp'];
export type ScannerExperienceKeysValue = (typeof SCANNER_QUERY_OPTIONS)['exp'][ScannerExperience];
export type ScannerScope = keyof (typeof SCANNER_QUERY_OPTIONS)['scope'];
export type ScannerScopeKeysValue = (typeof SCANNER_QUERY_OPTIONS)['scope'][ScannerScope];
export type ScannerJobType = keyof (typeof SCANNER_QUERY_OPTIONS)['type'];
export type ScannerJobTypeKeysValue = (typeof SCANNER_QUERY_OPTIONS)['type'][ScannerJobType];

export type ScannerName = 'drushim' | 'linkedin' | 'gotFriends' | 'allJobs';

export interface GeneralQueryProps<T extends ScannerName> {
  exp: Record<T, (typeof SCANNER_QUERY_OPTIONS)['exp'][T]>;
  scope: Record<T, (typeof SCANNER_QUERY_OPTIONS)['scope'][T]>;
  type: Record<T, (typeof SCANNER_QUERY_OPTIONS)['type'][T]>;
  distance: Record<T, (typeof SCANNER_QUERY_OPTIONS)['distance'][T]>;
  positions: typeof POSITIONS_DICT_NAME;
  locations: typeof LOCATIONS_DB;
}

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

  queryOptions: GeneralQueryProps<T>;
  userInput: UserInput;
  constructor(UserInput: UserInput) {
    this.queryOptions = SCANNER_QUERY_OPTIONS;
    this.userInput = UserInput;
    this.location = this.convertLocation();
    this.position = this.convertPosition();
    this.exp = this.convertExperience();
    this.scope = this.convertScope();
    this.type = this.convertType();
    this.distance = this.convertDistance();
  }

  protected convertPosition(): string {
    throw new Error('Method not implemented.');
  }
  protected convertLocation(): string {
    throw new Error('Method not implemented.');
  }

  protected convertScope(): string {
    throw new Error('Method not implemented.');
  }
  protected convertType(): string {
    throw new Error('Method not implemented.');
  }
  protected convertExperience(): string {
    throw new Error('Method not implemented.');
  }
  protected convertDistance(): string {
    throw new Error('Method not implemented.');
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
