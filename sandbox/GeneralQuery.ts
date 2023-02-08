/* eslint-disable @typescript-eslint/no-empty-interface */
import axios from 'axios';
import { GenericRecord } from '../lib/types/types';

class GeneralQuery {
  buildLocationQuery() {
    return '';
  }
}

const q = {
  location: 'telaviv',
  postition: 'fullstack',
  distance: 10, // 10,25,50,75,

  type: '1,2"', // 1 hybrid, 2:home ,3:onsite
  scope: '1,2', // 1 full, 2:part
  experience: '1,2', //without -1 ,between 1-2,
};
const qu = {
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
  position: {
    linkedin: { keywords: 'freeSearch' },
    gotFriends: undefined,
    allJobs: {},
    drushim: { searchterm: '' },
  },
  locations: {
    linkedin: { location: 'freeSearch' },
    gotFriends: undefined,
    allJobs: {},
    drushim: {},
  },
};

const gotf = {
  'tel aviv': 1,
  jerusalem: 2,
  eilat: '3',
  hashron: '4',
  'beer sheva': '5',
  haifa: '6',
  שפלה: '7',
};

export interface MainResultParameter {
  max: number;
  offset: number;
  sortings: any[];
  parameters: any[];
  options: any[];
  infos: any[];
}

export interface ResultParameters {}

export interface HttpRequestInfo {}

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
  resultParameters: ResultParameters;
  cookies: any[];
  httpRequestInfo: HttpRequestInfo;
  parameters: Parameter[];
  options: any[];
  infos: any[];
}

export interface ResultList {
  total: number;
  columnNames: string[];
  columnPosition: ColumnPosition;
  rows: string | undefined[][];
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

export interface Feedbacks {}

export interface SubResults {}
export interface Result {
  resultList: ResultList;
  metaDatas: MetaDatas;
  feedbacks: Feedbacks;
  subResults: SubResults;
  queryItems: any[];
  cookies: any[];
}
// {name: "suggestTypes", value: "jd~he,jd~en,company_name"}
// {
// name: 'suggestTypes',
// value: 'geo_multiple_city_id~en,geo_multiple_city_id~he',
// value: 'geo_multiple_city_id~he',
// value: 'jd~he,jd~en,geo_multiple_city_id',
// value:"skill_facet"
// },
