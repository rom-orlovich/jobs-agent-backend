import { LOCATIONS_DICT_DB } from '../createQueryDB/locationDB';
import { POSITIONS_DICT_DB } from '../createQueryDB/positionDictDB';
import { SCANNER_QUERY_OPTIONS } from './ScannerQueryOptions';

export type ScannerName = 'linkedin' | 'gotFriends' | 'allJobs' | 'drushim';
export type ScannerQueryOptions = typeof SCANNER_QUERY_OPTIONS;

// Which query: experience,scope,jobType...
export type ScannerQueryOptionsKeys = keyof ScannerQueryOptions;
////////////////////////////////////////////////////////////////////////////////////////////////////
/**
   * For example:
   *  jobType: {
      linkedin: { f_WT: { '1': '3', '2': '2', '3': '1' } },
      gotFriends: undefined,
      allJobs: { type: { '1': '37', '2': { region: '11' }, '3': '' } },
      drushim: { scope: { '2': '5' } },
    },
   */
export type ScannerQueryOptionsValues<K extends ScannerQueryOptionsKeys> = ScannerQueryOptions[K];
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Name of Scanners: linkedin ,gotFriends ,allJobs ,drushim
export type ScannerQueryOptionsKeysScannerName<
  K extends ScannerQueryOptionsKeys = ScannerQueryOptionsKeys
> = keyof ScannerQueryOptionsValues<K>;

/////////////////////////////////////////////////////////////////////////////////////////////////////

/** For jobType-linkedin
 *  { f_WT: { '1': '3', '2': '2', '3': '1' } },
 */
export type ScannerQueryOptionsByScannerName<
  K extends ScannerQueryOptionsKeys = ScannerQueryOptionsKeys,
  SN extends ScannerQueryOptionsKeysScannerName<K> = keyof ScannerQueryOptionsValues<K>
> = ScannerQueryOptionsValues<K>[SN];
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Keys of jobType-linkedin-f_WT
export type ScannerPropsQueryKeys<
  K extends ScannerQueryOptionsKeys = ScannerQueryOptionsKeys,
  SN extends keyof ScannerQueryOptionsValues<K> = keyof ScannerQueryOptionsValues<K>
> = keyof ScannerQueryOptionsByScannerName<K, SN>;
/////////////////////////////////////////////////////////////////////////////////////////////////////

// keys of jobType-linkedin-f_WT: { '1': '3', '2': '2', '3': '1' } }= '1' ,'2' ,'3'
export type ScannerPropsQueryValues<
  K extends ScannerQueryOptionsKeys = ScannerQueryOptionsKeys,
  SN extends keyof ScannerQueryOptionsValues<K> = keyof ScannerQueryOptionsValues<K>,
  SNK extends ScannerPropsQueryKeys<K, SN> = ScannerPropsQueryKeys<K, SN>
> = keyof ScannerQueryOptionsByScannerName<K, SN>[SNK];
/////////////////////////////////////////////////////////////////////////////////////////////////////

export type Experience<T extends ScannerName> = ScannerPropsQueryValues<'experience', T>;
export type Scope<T extends ScannerName> = ScannerPropsQueryValues<'scope', T>;
export type JobType<T extends ScannerName> = ScannerPropsQueryValues<'jobType', T>;
export type Distance<T extends ScannerName> = ScannerPropsQueryValues<'distance', T>;

/////////////////////////////////////////////////////////////////////////////////////////////////////
export interface QueryOptionsResProps {
  experience: string;
  scope: string;
  jobType: string;
  distance: string;
  position: string;
  location: string;
}

export interface UserInput {
  location: keyof typeof LOCATIONS_DICT_DB;
  position: keyof typeof POSITIONS_DICT_DB;
  distance: '1' | '2' | '3';
  jobType: string;
  scope: string;
  experience: string;
  blackList: string[];
}
