import { LOCATIONS_DB } from '../sandbox/locationDB';
import { POSITIONS_DICT_NAME } from '../sandbox/positionDictDB';
import { BLACK_LIST_WORDS } from './LinkedinQueryOptions';

export interface UserInput {
  location: string;
  postition: string;
  distance: number;
  type: string;
  scope: string;
  experience: string;
  blackList: string[];
}

const SCANNER_QUERY_OPTIONS = {
  exp: {
    linkedin: {
      f_e: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
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
  position: POSITIONS_DICT_NAME,
  locations: LOCATIONS_DB,
};

export class GeneralQuery {
  blackList: typeof BLACK_LIST_WORDS;
  queryOptions: typeof SCANNER_QUERY_OPTIONS;
  constructor(UserInput: UserInput) {
    this.queryOptions = SCANNER_QUERY_OPTIONS;
    this.blackList = UserInput.blackList || [];
  }

  checkWordInBlackList(word: string) {
    return (
      this.blackList?.length &&
      this.blackList?.some((bl) => {
        return word.toLowerCase().includes(bl.toLowerCase());
      })
    );
  }
}
