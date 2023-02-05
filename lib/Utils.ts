import { AnyFun } from './types/types';

export const benchmarkTimeMS = async (cb: AnyFun) => {
  const timePre = new Date().getMilliseconds();
  await cb();
  const timeAfter = new Date().getMilliseconds();
  console.log(`Its takes ${timeAfter - timePre} ms`);
};

export const untilSuccess = async (cb: AnyFun) => {
  let isSuccess = false;
  while (!isSuccess) {
    try {
      await cb();
      isSuccess = true;
    } catch (error) {
      console.log(error);
      isSuccess = false;
    }
  }
  return isSuccess;
};
