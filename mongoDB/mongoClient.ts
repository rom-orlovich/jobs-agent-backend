import { MongoClient } from 'mongodb';

export class MongoDBClient {
  client: MongoClient;

  constructor() {
    this.client = new MongoClient(process.env.MONGO_DB_URI || '');
  }
  async connect() {
    return await this.client.connect();
  }
  async close() {
    return await this.client.close();
  }

  createDBcollection(dbName: string, collectionName: string) {
    return this.client.db(dbName).collection(collectionName);
  }
}
