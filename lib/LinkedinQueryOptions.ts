import {
  GeneralQuery,
  ScannerExperienceKeysValue,
  ScannerJobTypeKeysValue,
  ScannerLocationsNames,
  ScannerPositionsNames,
  ScannerScopeKeysValue,
  UserInput,
} from './GeneralQuery';
import { ValueObj } from './types/types';

export const POSITIONS = {
  'Javascript Developer': '25170',
  'Frontend Developer': '3172',
  'Full Stack Engineer': '25201',
  'Quality Assurance Engineer': '292',
  'Electrical Engineer': '293',
  'Quality Assurance Automation Engineer': '11227',
  'Data Engineer': '2732',
  'Automation Engineer': '1510',
  'DevOps Engineer': '25764',
  'Software Engineer': '9',
  'Python Developer': '25169',
  Engineer: '10',
  'Back End Developer': '25194',
} as const;

const PERIOD = {
  'past month': 'r2592000',
  'past week': 'r604800',
  '24hr': 'r86400',
} as const;

export const WHITE_LIST_WORDS = [
  'React',
  'Javascript',
  'Full Stack',
  'Frontend',
  'Backend',
  'Web',
  'Front End',
  'Back End',
];
// f_WT
const REMOTE_FILTER_RANGE = {
  'on site': '1',
  remote: '2',
  hybrid: '3',
};
//f_E
const EXPERINCE_RANGE = {
  internship: '1', //without
  'entry level': '2', //1-2
  associate: '3', //3-4
  senior: '4', //4-6
  director: '5', //7+
  executive: '6',
};
// f_JT
const JOB_TYPE_RANGE = {
  'full time': 'F',

  'part time': 'P',
};

export const BLACK_LIST_WORDS = ['Angular', 'Senior', 'Lead'];

export const lan = [
  'Javascript',
  'React',
  'Typescript',
  'Nodejs',
  'node',
  'javascript',
  'mongoDB',
  'SQL',
];

const SORT_BY = {
  relevant: 'R',
  recent: 'DD',
} as const;

const DISTANCE_MILE = {
  '10 mi (15km)': '10',
  '25 mi (40 km)': '25',
  '50 mi (80 km)': '50',
  '75 mi (120 km)': '75',
  '100 mi (160 km)': '100',
} as const;

export class LinkedinQueryOptions extends GeneralQuery<'linkedin'> {
  period: string;
  sortBy: string;
  // jobQuery: string;
  // positionsQuery: string;
  // location: string;
  // limit: number;
  // distance: ValueObj<typeof DISTANCE_MILE>;
  // period: ValueObj<typeof PERIOD>;
  // sortBy: ValueObj<typeof SORT_BY>;

  // {
  //   jobQuery?: string;
  //   positions?: (keyof typeof POSITIONS)[];
  //   limit?: number;
  //   distance?: keyof typeof DISTANCE_MILE;
  //   location?: string;
  //   whiteList?: typeof WHITE_LIST_WORDS;
  //   blackList?: typeof BLACK_LIST_WORDS;
  //   sortBy?: keyof typeof SORT_BY;
  //   period?: keyof typeof PERIOD;
  // }

  constructor(userInput: UserInput) {
    super(userInput);
    this.period = this.convertPeriod();
    this.sortBy = this.convertSortBy();
    // this.limit = queryOptions.limit || 1000;

    // this.distance = this.convertDistanceMile(queryOptions.distance.linkedin);
    // this.location = this.convertLocation(queryOptions.location);
    // this.jobQuery = this.convertJob(queryOptions.jobQuery);
    // this.positionsQuery = this.convertPositions(queryOptions.positions);
    // this.period = this.convertPeriod(queryOptions.period);
    // this.sortBy = this.convertSortBy(queryOptions.sortBy);
  }

  protected convertPosition() {
    const positionDict = this.queryOptions.positions[
      this.userInput.position as ScannerPositionsNames
    ] as { en: string; he: string };
    if (!positionDict) return this.userInput.position;
    return positionDict.en.split(' ').join('+');
  }
  protected convertLocation() {
    const locationDict =
      this.queryOptions.locations[this.userInput.location as ScannerLocationsNames].en;
    if (!locationDict) return this.userInput.location;
    return locationDict.split(' ').join('%20');
  }
  //  convertPositions(positions: (keyof typeof POSITIONS)[] = []) {
  //   return this.queryOptions.position[this.userInput.position as ScannerPositionsNames];
  //   // return positions.map((namesPosition) => POSITIONS[namesPosition]).join('%2C');
  // }
  // type
  // scope
  // experience
  protected convertScope() {
    const scopesArr = this.userInput.scope.split(',').map((el) => {
      const scope = el as keyof ScannerScopeKeysValue;
      return this.queryOptions.scope.linkedin.f_JT[scope];
    });

    return scopesArr.join(',');
  }
  protected convertType() {
    const scopesArr = this.userInput.scope.split(',').map((el) => {
      const scope = el as keyof ScannerJobTypeKeysValue;
      return this.queryOptions.scope.linkedin.f_JT[scope];
    });

    return scopesArr.join(',');
  }

  protected convertExperience() {
    const yearExperienceArr = this.userInput.experience.split(',').map((el) => {
      const expY = el as keyof ScannerExperienceKeysValue;
      return this.queryOptions.exp.linkedin.f_e[expY];
    });
    return yearExperienceArr.join(',');
  }

  protected convertPeriod(period: keyof typeof PERIOD = 'past month') {
    return PERIOD[period];
  }
  protected convertSortBy(sortBy: keyof typeof SORT_BY = 'relevant') {
    return SORT_BY[sortBy];
  }
  protected convertDistance() {
    return this.queryOptions.distance.linkedin.distance[this.userInput.distance];
  }
}
