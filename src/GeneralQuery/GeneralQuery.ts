import { LOCATIONS_DICT_DB } from '../createQueryDB/locationDB';
import { POSITIONS_DICT_DB } from '../createQueryDB/positionDictDB';
import { Experience, QueryOptionsResProps, ScannerName, UserInput } from './generalQuery';
import { SCANNER_QUERY_OPTIONS } from './ScannerQueryOptions';
import { createHash } from 'crypto';
export class GeneralQuery<T extends ScannerName> implements QueryOptionsResProps {
  experience: string;
  scope: string;
  jobType: string;
  distance: string;
  position: string;
  location: string;

  queryOptions: typeof SCANNER_QUERY_OPTIONS;
  userInput: UserInput;
  scannerName: ScannerName;
  hash: string;
  constructor(scannerName: T, UserInput: UserInput) {
    this.scannerName = scannerName;
    this.queryOptions = SCANNER_QUERY_OPTIONS;
    this.userInput = UserInput;
    this.location = this.convertLocation().split(' ').join('%20');
    this.position = this.convertPosition().split(' ').join('%20');
    this.experience = this.convertExperience();
    this.scope = this.convertScope();
    this.jobType = this.convertJobType();
    this.distance = this.convertDistance();
    this.hash = GeneralQuery.hashQuery(this.userInput);
  }
  static hashQuery(userInput: UserInput) {
    const { distance, experience, jobType, location, position, scope } = userInput;
    const hash = createHash('sha1')
      .update(distance + experience + jobType + location + position + scope)
      .digest('hex');

    return hash;
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
    let res = '';
    const userInputSplit = this.userInput.experience.split(',');
    if (userInputSplit.length === 0) return '';
    if (this.scannerName === 'linkedin') {
      yearExperienceArr = userInputSplit.map((el) => {
        const expY = el as Experience<'linkedin'>;
        return this.queryOptions.experience.linkedin.f_e[expY];
      });
      res = yearExperienceArr.join('%2C');
    }

    if (this.scannerName === 'drushim') {
      yearExperienceArr = userInputSplit.map((el) => {
        const expY = el as Experience<'drushim'>;
        return this.queryOptions.experience.drushim.experience[expY];
      });
      res = yearExperienceArr.join('-');
    }
    return res;
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

  protected convertScope() {
    return '';
  }

  protected convertJobType(): string {
    return '';
  }
}
