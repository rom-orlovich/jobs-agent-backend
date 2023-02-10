import { LOCATIONS_DICT_DB } from '../createQueryDB/locationDB';
import { GeneralQuery, GeneralQueryJobType, GeneralQueryScope, UserInput } from '../GeneralQuery';

export class DrushimQueryOptions extends GeneralQuery<'drushim'> {
  constructor(userInput: UserInput) {
    super('drushim', userInput);
  }

  protected convertLocation(): string {
    const userInput = this.userInput.location as keyof typeof LOCATIONS_DICT_DB;
    return this.queryOptions.locations[userInput].geolexid;
  }
  protected convertScope(): string {
    let scopesArr = [];
    const userInputSplit = this.userInput.scope.split(',');

    if (userInputSplit.length === 0) return '';

    scopesArr = userInputSplit.map((el) => {
      const scope = el as GeneralQueryScope<'drushim'>;
      return this.queryOptions.scope.drushim.scope[scope];
    });

    const jobType = this.userInput.jobType as GeneralQueryJobType<'drushim'>;
    const jobTypeRes = this.queryOptions.jobType.drushim.scope[jobType] || '';

    return `${scopesArr.join('-')}${jobTypeRes ? `-${jobTypeRes}` : ''}`;
  }
  protected convertJobType(): string {
    return '';
  }
}
