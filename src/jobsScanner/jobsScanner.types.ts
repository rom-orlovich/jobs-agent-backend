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
}
export type DataWithText<T> = T & { text: string; title: string };
export type JobPost = DataWithText<Job>;
