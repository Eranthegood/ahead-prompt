export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const memoryStore = new Map<string, string>();

const memoryStorage: StorageLike = {
  getItem: (k) => (memoryStore.has(k) ? memoryStore.get(k)! : null),
  setItem: (k, v) => {
    memoryStore.set(k, v);
  },
  removeItem: (k) => {
    memoryStore.delete(k);
  },
};

function createBrowserStorage(): StorageLike {
  try {
    const testKey = '__safe_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return {
      getItem: (k) => window.localStorage.getItem(k),
      setItem: (k, v) => {
        try {
          window.localStorage.setItem(k, v);
        } catch {
          memoryStorage.setItem(k, v);
        }
      },
      removeItem: (k) => {
        try {
          window.localStorage.removeItem(k);
        } catch {
          memoryStorage.removeItem(k);
        }
      },
    };
  } catch {
    return memoryStorage;
  }
}

export const safeStorage: StorageLike =
  typeof window === 'undefined' ? memoryStorage : createBrowserStorage();
