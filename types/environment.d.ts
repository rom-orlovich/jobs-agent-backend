export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      MONGO_DB_URI: string;
      EXPIRE_AT: number;
      PORT: number;
      CLIENT_URL_DEV: string;
      CLIENT_URL_PRO: string;
      SLOW_MOV: number;
      THROAT_LIMIT: number;
      TOTAL_CPU: number;
      TIMEOUT_TRY_SELECTOR: number;
      RABBIT_MQ_HOST: string;
      RABBITMQ_DEFAULT_USER: string;
      RABBITMQ_DEFAULT_PASS: string;
      RABBITMQ_MESSAGE_ACK_TIMEOUT: number;
    }
  }
}
