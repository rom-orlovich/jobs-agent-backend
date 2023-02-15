export interface Job {
  jobID: string;
  title: string;
  company: string;
  location: string;
  link: string;
  reason?: string;
  date?: string;
  from: string;
  addedAt: Date;
}
export type DataWithText<T> = T & { text: string };
export type JobPost = DataWithText<Job>;
