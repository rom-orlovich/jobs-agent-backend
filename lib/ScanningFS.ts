import path from 'path';
import { readFile, writeFile } from 'fs/promises';

import { json2csvAsync, csv2jsonAsync } from 'json-2-csv';
import { GenericRecord } from './types';
export class ScanningFS {
  static createPathJobsJSON(fileName = `jobs2.json`) {
    return path.join(__dirname, '../', 'JSON', fileName);
  }

  static createPathJobsCSV(fileName = 'jobs.csv') {
    return path.join(__dirname, '../', 'csv', fileName);
  }

  //Todo: move these function to fs class.
  static async readJSON<T>(path: string): Promise<T | undefined> {
    try {
      return JSON.parse(await readFile(path, 'utf8'));
    } catch (error) {
      console.log(error);
      return undefined;
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
  private static orderKey<T extends GenericRecord<any>>(data: T[]) {
    return Object.keys(data[0])
      .sort((a, b) => {
        if (a.match(/id/gi)) return -1;
        if (b.match(/id/gi)) return 1;
        if (a === 'title') return -1;
        if (b === 'title') return 1;
        if (a === 'from') return -1;
        if (b === 'from') return 1;
        if (a === 'reason') return -1;
        if (b === 'reason') return 1;
        return 0;
      })
      .map((el) => ({ field: el, title: el }));
  }

  static async writeCSV<T extends GenericRecord<any>>(data: T[], path: string) {
    try {
      const csv = await json2csvAsync(data, {
        keys: ScanningFS.orderKey(data),
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
  static async writeData<T extends GenericRecord<any>>(data: T[], fileName?: string) {
    const jobs = await ScanningFS.writeCSV(data, ScanningFS.createPathJobsCSV(fileName));
    return jobs;
  }
}
