import { LOCATIONS_DICT_DB } from '../sandbox/locationDB';
import { GeneralQuery, UserInput } from './GeneralQuery';

export class DrushimQueryOptions extends GeneralQuery<'drushim'> {
  constructor(userInput: UserInput) {
    super('drushim', userInput);
  }

  protected convertLocation(): string {
    const userInput = this.userInput.location as keyof typeof LOCATIONS_DICT_DB;
    return this.queryOptions.locations[userInput].geolexid;
  }
}
