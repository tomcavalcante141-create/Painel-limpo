const DB_NAME = "painel-images";
const STORE = "panels";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePanelImage(id: string, dataUrl: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(dataUrl, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyImages();
}

export async function loadPanelImages(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0 || typeof indexedDB === "undefined") return {};
  const db = await openDb();
  const out: Record<string, string> = {};
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    for (const id of ids) {
      const req = store.get(id);
      req.onsuccess = () => {
        if (typeof req.result === "string") out[id] = req.result;
      };
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return out;
}

export async function deletePanelImage(id: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyImages();
}

const listeners = new Set<() => void>();

export function notifyImages() {
  listeners.forEach((fn) => fn());
}

export function subscribeImages(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
