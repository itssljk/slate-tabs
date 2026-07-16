const DB_NAME = "slate-tabs-db";
const STORE_NAME = "backgrounds";
const DB_VERSION = 1;

function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported on this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveBackgroundBlob(blob: Blob): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, "custom-upload");
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getBackgroundBlob(): Promise<Blob | null> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("custom-upload");
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load background from IndexedDB:", error);
    return null;
  }
}

export async function clearBackgroundBlob(): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete("custom-upload");
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export interface BackgroundSettings {
  type: "default" | "curated" | "upload" | "url";
  opacity: number;
  blur: number;
  dim: number;
  curatedUrl: string;
  urlLink: string;
}

export const DEFAULT_BG_SETTINGS: BackgroundSettings = {
  type: "default",
  opacity: 50,
  blur: 0,
  dim: 40,
  curatedUrl: "",
  urlLink: "",
};

