import { GotFriendsPositions } from '../createQueryDB/lib/createQueryDB';
import { LOCATIONS_DICT_DB } from '../createQueryDB/locationDB';
import { POSITIONS_DICT_DB } from '../createQueryDB/positionDictDB';
import { GeneralQuery } from '../GeneralQuery/GeneralQuery';
import { UserInput } from '../GeneralQuery/generalQuery';

export class GotFriendQueryOptions extends GeneralQuery<'gotFriends'> {
  checkboxProfessions: string;
  radioAreas: string;
  constructor(userInput: UserInput) {
    super('gotFriends', userInput);
    const { checkboxProfessions, radioAreas } = this.convertPositionGotFriends();
    this.checkboxProfessions = checkboxProfessions;
    this.radioAreas = radioAreas;
  }

  protected convertPositionGotFriends(): GotFriendsPositions {
    const userInput = this.userInput.position as keyof typeof POSITIONS_DICT_DB;

    return (
      this.queryOptions.positions[userInput]?.gotFriends || {
        checkboxProfessions: '',
        radioAreas: '',
      }
    );
  }
  protected convertPosition(): string {
    return '';
  }

  protected convertLocation(): string {
    const userInput = this.userInput.location as keyof typeof LOCATIONS_DICT_DB;
    return this.queryOptions.locations[userInput].checkboxRegions;
  }
}
