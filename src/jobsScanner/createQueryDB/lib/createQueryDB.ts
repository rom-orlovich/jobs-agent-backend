import { HebrewPosKeys } from '../hePosWords';

export interface ChildCategory {
  ID: number;
  ParentID: number;
  Name: string;
  JobCount: number;
  Keywords: string;
  JobCategoryNameMultiGender: string;
}
export interface AllJobsCats {
  ID: number;
  Name: string;
  JobCount: number;
  ChildCategories: ChildCategory[];
}
export interface GotFriendsPositions {
  checkboxProfessions: string;
  radioAreas: string;
}
export interface AllPositionName {
  regularName: string;
  gotFriends: GotFriendsPositions;
}
export type PositionData = Record<
  HebrewPosKeys,
  {
    he: string;
    gotFriends?: GotFriendsPositions;
    en: string;
  }
>;

export interface DrushimCitiesData {
  he: string;
  geolexid: string;
  en?: string;
}
export interface AllJobCityData {
  source: number;
  allJobCityName: string;
  checkboxRegions: string;
}

export interface MainResultParameter {
  max: number;
  offset: number;
  sortings: any[];
  parameters: any[];
  options: any[];
  infos: any[];
}

export interface Parameter {
  name: string;
  value: string;
}

export interface Root {
  application: string;
  country: string;
  environment: string;
  searchType: string;
  queryItems: any[];
  mainResultParameter: MainResultParameter;
  resultParameters: any;
  cookies: any[];
  httpRequestInfo: any;
  parameters: Parameter[];
  options: any[];
  infos: any[];
}

export interface ResultList {
  totalPages: number;
  columnNames: string[];
  columnPosition: ColumnPosition;
  rows: (string | undefined)[][];
}

export interface ColumnPosition {
  relativeFrequency: number;
  hitCount: number;
  parentDisplayString: number;
  type: number;
  parentId: number;
  parentType: number;
  frequency: number;
  score: number;
  typeRelativeId: number;
  displayString: number;
  lastUpdate: number;
  drushim_region_ids: number;
  selected: number;
}

export interface MetaDatas {
  totalcount: string;
  run_time: string;
  'es_shard_[drushimil][0]_search_run_time': string;
  'server.hostname': string;
  'server.ip': string;
  'server.version': string;
}

export interface Result {
  resultList: ResultList;
  metaDatas: MetaDatas;
  feedbacks: any;
  subResults: any;
  queryItems: any[];
  cookies: any[];
}
