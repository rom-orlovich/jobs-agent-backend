import { GenericRecord, PickKey } from '../../lib/types';

export interface Job {
  jobID: string;
  title: string;
  company: string;
  location: string;
  link: string;
  reason?: string;
  date?: string;
  from: string;
  createdAt?: Date;
  text: string;
}

export interface QueryOptions {
  title?: string;
  reason?: string;
  from?: string;
  page?: string;
  limit?: string;
}

export interface QueryOptionsRes {
  match: GenericRecord<RegExp>;
  page?: number;
  limit?: number;
}

export type JobsResultAgg = {
  jobs: Job[];
  pagination: { totalDocs: number }[];
  numResultsFound: { numResultsFound: number }[];
};

export type JobsResults = PickKey<JobsResultAgg, 'jobs'> & {
  pagination: PickKey<JobsResultAgg, 'pagination'>['pagination'][0] & {
    totalPages: number;
    hasMore: boolean;
    numResultsFound: number;
  };
};
