import throat from 'throat';
import { AnyFun } from './types';

export const benchmarkTimeMS = async (cb: AnyFun) => {
  console.time('Time:');
  await cb();

  console.timeEnd('Time:');
};

export const untilSuccess = (maxTry = Number(process.env.MAX_TRY || 5)) => {
  let curTry = 1;
  return async (cb: AnyFun) => {
    const isSuccess = true;
    while (isSuccess) {
      try {
        if (curTry >= maxTry) return true;
        curTry++;

        await cb();
        return;
      } catch (error) {
        console.log(error);
      }
    }
  };
};

export const delayFun = (cb: AnyFun, delay: number) =>
  new Promise((res) =>
    setTimeout(async () => {
      res(await cb());
    }, delay)
  );

export const throatPromises = <T>(throatNum: number, promises: Promise<T>[]) =>
  promises.map(throat(throatNum, (el) => el));

export const isEnvMode = (...envs: (typeof process.env.NODE_ENV)[]) =>
  envs.includes(process.env.NODE_ENV);
