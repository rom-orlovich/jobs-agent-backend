import { Collection, Db, MongoClient } from 'mongodb';
import { AnyFun, GenericRecord } from '../lib/types';

export class MongoDBClient {
  client: MongoClient;
  DBMap: GenericRecord<Db>;
  collectionsMap: GenericRecord<Collection>;
  constructor() {
    this.client = new MongoClient(process.env.MONGO_DB_URI || '');
    this.DBMap = {};
    this.collectionsMap = {};
  }
  async connect() {
    return await this.client.connect();
  }
  async close() {
    return await this.client.close();
  }
  getClient() {
    return this.client;
  }
  createDBcollection(dbName: string, collectionName: string) {
    return this.client.db(dbName).collection(collectionName);
  }

  createCollection(dbName: keyof typeof this.DBMap, collectionName: string) {
    const db = this.getDB(dbName);
    this.collectionsMap.collectionName = db.collection(collectionName);
    return this.collectionsMap.collectionName;
  }

  getDB(dbName: keyof typeof this.DBMap) {
    return this.DBMap[dbName];
  }

  getCollection(collectionName: keyof typeof this.collectionsMap) {
    return this.collectionsMap[collectionName];
  }

  async mongoDBSetup(CB: AnyFun) {
    try {
      await this.connect();
      await CB();
    } catch (error) {
      await this.close();
    }
  }
}
