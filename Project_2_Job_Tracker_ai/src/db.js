import { openDB } from 'idb';

const DB_NAME = 'job-tracker-db';
const DB_VERSION = 1;
const STORE = 'jobs';

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('status', 'status');
      }
    },
  });
}

export async function getAllJobs() {
  return (await getDB()).getAll(STORE);
}

export async function saveJob(job) {
  return (await getDB()).put(STORE, job);
}

export async function removeJob(id) {
  return (await getDB()).delete(STORE, id);
}

export async function clearAllJobs() {
  return (await getDB()).clear(STORE);
}
