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
    }
  }
}
