import throat from 'throat';
import { AnyFun } from './types';

export const benchmarkTimeMS = async (cb: AnyFun) => {
  console.time('Time:');
  await cb();

  console.timeEnd('Time:');
};

export const untilSuccess = async (cb: AnyFun) => {
  const isSuccess = true;
  while (isSuccess) {
    try {
      await cb();
      return true;
    } catch (error) {
      console.log(error);
    }
  }
};

export const throatPromises = <T>(throatNum: number, promises: Promise<T>[]) =>
  promises.map(throat(throatNum, (el) => el));
