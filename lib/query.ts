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

const BLACK_LIST_WORDS = ['Angular', 'Senior', 'Lead'];

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

export class Query {
  jobQuery: string;
  positionsQuery: string;
  limit: number;
  whiteList: typeof WHITE_LIST_WORDS;
  blackList: typeof BLACK_LIST_WORDS;
  distance: number;
  location: string;

  constructor(queryOptions: {
    jobQuery: string;
    positions: (keyof typeof POSITIONS)[];
    limit?: number;
    whiteList?: typeof WHITE_LIST_WORDS;
    blackList?: typeof BLACK_LIST_WORDS;
    distance?: number;
    location?: string;
  }) {
    this.jobQuery = this.convertJob(queryOptions.jobQuery);
    this.positionsQuery = this.convertPositions(queryOptions.positions);
    this.limit = queryOptions.limit || 1000;
    this.whiteList = queryOptions.whiteList || [];
    this.blackList = queryOptions.blackList || [];
    this.distance = queryOptions.distance || 10;
    this.location = queryOptions.location || '';
  }

  private convertJob(job: string) {
    return job.split(' ').join('+');
  }
  private convertPositions(positions: (keyof typeof POSITIONS)[]) {
    return positions
      .map((namesPosition) => POSITIONS[namesPosition])
      .join('%2C');
  }
}
