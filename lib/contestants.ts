export const EXPIRE_AT =
  process.env.NODE_ENV === 'test' ? 1000 * 60 : Number(process.env.EXPIRE_AT) * 1000 * 60 * 60;

export const EXPIRE_AT_MONGO_DB = EXPIRE_AT / 1000;
