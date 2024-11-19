import { openDB } from 'idb';

const DB_NAME = 'artconnect_offline';
const STORE_NAME = 'auth_cache';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

export async function saveAuthCache(key: string, value: any) {
  const db = await dbPromise;
  await db.put(STORE_NAME, value, key);
}

export async function getAuthCache(key: string) {
  const db = await dbPromise;
  return db.get(STORE_NAME, key);
}

export async function clearAuthCache() {
  const db = await dbPromise;
  await db.clear(STORE_NAME);
}