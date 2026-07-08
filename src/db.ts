import { openDB } from 'idb';

const DB_NAME = 'FinancialAppDB';
const DB_VERSION = 5;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('todos')) {
        db.createObjectStore('todos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('team_todos')) {
        db.createObjectStore('team_todos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('ceklok_logs')) {
        db.createObjectStore('ceklok_logs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('ceklok_settings')) {
        db.createObjectStore('ceklok_settings', { keyPath: 'key' });
      }
    },
  });
};
