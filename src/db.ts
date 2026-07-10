import { db } from './db/schema';

export const initDB = async () => {
  if (!db.isOpen()) {
    await db.open();
  }
  
  // Return an adapter matching the old idb library methods
  return {
    async get(storeName: string, key: any) {
      return await db.table(storeName).get(key);
    },
    async getAll(storeName: string) {
      return await db.table(storeName).toArray();
    },
    async put(storeName: string, value: any) {
      // In Dexie, put returns the primary key
      return await db.table(storeName).put(value);
    },
    async delete(storeName: string, key: any) {
      return await db.table(storeName).delete(key);
    }
  };
};
