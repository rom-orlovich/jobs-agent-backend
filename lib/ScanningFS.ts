import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { Job } from './types/linkedinScanner';
import { json2csvAsync, csv2jsonAsync } from 'json-2-csv';
import { GenericRecord } from './types/types';
export class ScanningFS {
  static createPathJobsJSON(fileName = `jobs2.json`) {
    return path.join(__dirname, '../', 'JSON', fileName);
  }

  static createPathJobsCSV(fileName = 'jobs.csv') {
    return path.join(__dirname, '../', 'csv', fileName);
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

  static async writeCSV<T extends GenericRecord<any>>(data: T[], path: string) {
    try {
      const csv = await json2csvAsync(data, {
        keys: Object.keys(data[0]).map((el) => ({ field: el, title: el })),
      });
      await writeFile(path, csv || '', 'utf-8');
      console.log(`finish create json file in ${path}`);
    } catch (error) {
      console.log(error);
    }
  }

  static async readCSV<T extends GenericRecord<any>>(path: string) {
    try {
      const json = await readFile(path, 'utf8');
      const csv = await csv2jsonAsync(json);
      console.log(`finish create json file in ${path}`);
      return csv as T[];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async loadData<T extends GenericRecord<any>>() {
    const jobs = await ScanningFS.readCSV(ScanningFS.createPathJobsCSV());

    return jobs as T[];
  }
  static async writeData<T extends GenericRecord<any>>(data: T[]) {
    const jobs = await ScanningFS.writeCSV(data, ScanningFS.createPathJobsCSV());
    return jobs;
  }
}
