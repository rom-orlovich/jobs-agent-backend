import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { Job } from './types/linkedinScrapper';

export class ScanningFS {
  static createPathPotentialJobsJSON(fileName = `jobs2.json`) {
    return path.join(__dirname, '../', 'JSON', fileName);
  }

  static createPathLogsJobJSON(fileName = 'job-logs2.json') {
    return path.join(__dirname, '../', 'logs', fileName);
  }

  //Todo: move these function to fs class.
  static async loadJSON<T>(path: string): Promise<T[]> {
    try {
      return JSON.parse(await readFile(path, 'utf8'));
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async writeJSON<T>(data: T, path: string) {
    try {
      await writeFile(path, JSON.stringify(data), 'utf-8');
      console.log(`finish create json file in ${path}`);
    } catch (error) {
      console.log(error);
    }
  }

  static async writeData(jobs: Job[]) {
    const jobsWrite = jobs.filter((el) => !el.reason);
    const logsWrite = jobs.filter((el) => el.reason);
    await ScanningFS.writeJSON(jobsWrite, ScanningFS.createPathPotentialJobsJSON());
    await ScanningFS.writeJSON(logsWrite, ScanningFS.createPathLogsJobJSON());
  }
  static async loadData() {
    const jobs = await ScanningFS.loadJSON(ScanningFS.createPathPotentialJobsJSON());
    const logs = await ScanningFS.loadJSON(ScanningFS.createPathLogsJobJSON());
    return [...jobs, ...logs];
  }
}
