import { QueryOptionsBase } from './QueryOptionsBase';
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

export class LinkedinQueryOptions extends QueryOptionsBase {
  jobQuery: string;
  positionsQuery: string;
  location: string;
  limit: number;
  distance: ValueObj<typeof DISTANCE_MILE>;
  period: ValueObj<typeof PERIOD>;
  sortBy: ValueObj<typeof SORT_BY>;

  constructor(queryOptions: {
    jobQuery?: string;
    positions?: (keyof typeof POSITIONS)[];
    limit?: number;
    distance?: keyof typeof DISTANCE_MILE;
    location?: string;
    whiteList?: typeof WHITE_LIST_WORDS;
    blackList?: typeof BLACK_LIST_WORDS;
    sortBy?: keyof typeof SORT_BY;
    period?: keyof typeof PERIOD;
  }) {
    super({ blackList: queryOptions.blackList, whiteList: queryOptions.whiteList });
    this.limit = queryOptions.limit || 1000;

    this.distance = this.convertDistanceMile(queryOptions.distance);
    this.location = this.convertLocation(queryOptions.location);
    this.jobQuery = this.convertJob(queryOptions.jobQuery);
    this.positionsQuery = this.convertPositions(queryOptions.positions);
    this.period = this.convertPeriod(queryOptions.period);
    this.sortBy = this.convertSortBy(queryOptions.sortBy);
  }

  private convertJob(job = '') {
    return job.split(' ').join('+');
  }
  private convertLocation(location = '') {
    return location.split(' ').join('%20');
  }
  private convertPositions(positions: (keyof typeof POSITIONS)[] = []) {
    return positions.map((namesPosition) => POSITIONS[namesPosition]).join('%2C');
  }
  private convertPeriod(period: keyof typeof PERIOD = 'past month') {
    return PERIOD[period];
  }
  private convertSortBy(sortBy: keyof typeof SORT_BY = 'relevant') {
    return SORT_BY[sortBy];
  }
  private convertDistanceMile(distanceMile: keyof typeof DISTANCE_MILE = '10 mi (15km)') {
    return DISTANCE_MILE[distanceMile];
  }
}