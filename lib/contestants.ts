export const MINUTE_IN_MS = 1000 * 60;
export const EXPIRE_AT =
  process.env.NODE_ENV === 'test'
    ? MINUTE_IN_MS
    : Number(process.env.EXPIRE_AT || 48) * MINUTE_IN_MS * 60;

export const EXPIRE_AT_MONGO_DB = EXPIRE_AT / 1000;
export const RABBITMQ_MESSAGE_ACK_TIMEOUT =
  Number(process.env.RABBITMQ_MESSAGE_ACK_TIMEOUT || 10) * MINUTE_IN_MS;
