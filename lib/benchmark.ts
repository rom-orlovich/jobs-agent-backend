import { AnyFun } from './types/types';

export const benchmarkTimeMS = async (cb: AnyFun) => {
  const timePre = new Date().getMilliseconds();
  await cb();
  const timeAfter = new Date().getMilliseconds();
  console.log(`Its takes ${timeAfter - timePre} ms`);
};
