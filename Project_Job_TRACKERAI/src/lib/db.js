import { openDB } from 'idb';

const DB_NAME = 'job-tracker-db';
const DB_VERSION = 1;
const STORE = 'jobs';

const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    },
  });

export const db = {
  async getAll() {
    return (await getDB()).getAll(STORE);
  },
  async put(item) {
    return (await getDB()).put(STORE, item);
  },
  async delete(id) {
    return (await getDB()).delete(STORE, id);
  },
  async clear() {
    return (await getDB()).clear(STORE);
  },
};
