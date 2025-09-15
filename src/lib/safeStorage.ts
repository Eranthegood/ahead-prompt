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
  // Try localStorage -> sessionStorage -> memory (best persistence first)
  try {
    const testKey = '__safe_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);

    return {
      getItem: (k) => window.localStorage.getItem(k),
      setItem: (k, v) => {
        try {
          window.localStorage.setItem(k, v);
        } catch (e) {
          try {
            window.sessionStorage.setItem(k, v);
            console.warn('[safeStorage] localStorage write failed, fell back to sessionStorage');
          } catch {
            memoryStorage.setItem(k, v);
            console.warn('[safeStorage] sessionStorage write failed, fell back to in-memory storage');
          }
        }
      },
      removeItem: (k) => {
        try {
          window.localStorage.removeItem(k);
        } catch {
          try {
            window.sessionStorage.removeItem(k);
          } catch {
            memoryStorage.removeItem(k);
          }
        }
      },
    };
  } catch (err) {
    // localStorage not accessible (e.g., 3rd-party context). Try sessionStorage.
    try {
      const testKey = '__safe_storage_session_test__';
      window.sessionStorage.setItem(testKey, '1');
      window.sessionStorage.removeItem(testKey);
      console.warn('[safeStorage] Falling back to sessionStorage due to localStorage unavailability');
      return {
        getItem: (k) => window.sessionStorage.getItem(k),
        setItem: (k, v) => {
          try {
            window.sessionStorage.setItem(k, v);
          } catch {
            memoryStorage.setItem(k, v);
            console.warn('[safeStorage] sessionStorage unavailable, using in-memory storage');
          }
        },
        removeItem: (k) => {
          try {
            window.sessionStorage.removeItem(k);
          } catch {
            memoryStorage.removeItem(k);
          }
        },
      };
    } catch {
      console.warn('[safeStorage] Using in-memory storage (no persistence across reloads)');
      return memoryStorage;
    }
  }
}

export const safeStorage: StorageLike =
  typeof window === 'undefined' ? memoryStorage : createBrowserStorage();
