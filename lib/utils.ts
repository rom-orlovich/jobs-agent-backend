import { AnyFun } from './types';

export const benchmarkTimeMS = async (cb: AnyFun) => {
  const timePre = new Date().getMilliseconds();
  await cb();
  const timeAfter = new Date().getMilliseconds();
  console.log(`Its takes ${timeAfter - timePre} ms`);
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
