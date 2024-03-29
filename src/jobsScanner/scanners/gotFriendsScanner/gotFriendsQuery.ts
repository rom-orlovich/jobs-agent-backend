import { GotFriendsPositions } from '../../createQueryDB/lib/createQueryDB';
import { LOCATIONS_DICT_DB } from '../../createQueryDB/locationDictDB';
import { POSITIONS_DICT_DB } from '../../createQueryDB/positionDictDB';
import { GeneralQuery } from '../../generalQuery/generalQuery';
import { UserQueryProps } from '../../generalQuery/query.types';

export class GotFriendQueryOptions extends GeneralQuery<'gotFriends'> {
  checkboxProfessions: string;
  radioAreas: string;
  constructor(userQuery: UserQueryProps) {
    super('gotFriends', userQuery);
    const { checkboxProfessions, radioAreas } = this.convertPositionGotFriends();
    this.checkboxProfessions = checkboxProfessions;
    this.radioAreas = radioAreas;
  }

  protected convertPositionGotFriends(): GotFriendsPositions {
    const positionName = this.userQuery.position as keyof typeof POSITIONS_DICT_DB;

    return (
      this.queryOptions.positions[positionName]?.gotFriends || {
        checkboxProfessions: '',
        radioAreas: '',
      }
    );
  }
  protected convertLocation(): string {
    const locationName = this.userQuery.location as keyof typeof LOCATIONS_DICT_DB;
    return this.queryOptions.locations[locationName]?.checkboxRegions || '';
  }

  protected convertPosition(): string {
    return '';
  }
  protected convertJobType(): string {
    return '';
  }
  protected convertScope(): string {
    return '';
  }
}
