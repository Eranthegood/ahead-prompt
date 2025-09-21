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

// Window.name storage fallback (persists across reloads in same tab)
const windowNameStorage: StorageLike = {
  getItem: (k) => {
    try {
      const data = JSON.parse(window.name || '{}');
      return data[k] || null;
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      const data = JSON.parse(window.name || '{}');
      data[k] = v;
      window.name = JSON.stringify(data);
    } catch {
      // If window.name is corrupted, reset it
      window.name = JSON.stringify({ [k]: v });
    }
  },
  removeItem: (k) => {
    try {
      const data = JSON.parse(window.name || '{}');
      delete data[k];
      window.name = JSON.stringify(data);
    } catch {
      // If window.name is corrupted, reset it
      window.name = '{}';
    }
  },
};

let activeStorageName = 'unknown';

function createBrowserStorage(): StorageLike {
  // Try localStorage -> sessionStorage -> windowName -> memory (best persistence first)
  try {
    const testKey = '__safe_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    activeStorageName = 'localStorage';

    return {
      getItem: (k) => window.localStorage.getItem(k),
      setItem: (k, v) => {
        try {
          window.localStorage.setItem(k, v);
        } catch (e) {
          try {
            window.sessionStorage.setItem(k, v);
            console.info('[safeStorage] localStorage write failed, fell back to sessionStorage');
          } catch {
            try {
              windowNameStorage.setItem(k, v);
              console.info('[safeStorage] sessionStorage write failed, fell back to window.name storage');
            } catch {
              memoryStorage.setItem(k, v);
              console.info('[safeStorage] window.name write failed, fell back to in-memory storage');
            }
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
            try {
              windowNameStorage.removeItem(k);
            } catch {
              memoryStorage.removeItem(k);
            }
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
      activeStorageName = 'sessionStorage';
      console.info('[safeStorage] Using sessionStorage due to localStorage unavailability');
      return {
        getItem: (k) => window.sessionStorage.getItem(k),
        setItem: (k, v) => {
          try {
            window.sessionStorage.setItem(k, v);
          } catch {
            try {
              windowNameStorage.setItem(k, v);
              console.info('[safeStorage] sessionStorage write failed, fell back to window.name storage');
            } catch {
              memoryStorage.setItem(k, v);
              console.info('[safeStorage] window.name write failed, fell back to in-memory storage');
            }
          }
        },
        removeItem: (k) => {
          try {
            window.sessionStorage.removeItem(k);
          } catch {
            try {
              windowNameStorage.removeItem(k);
            } catch {
              memoryStorage.removeItem(k);
            }
          }
        },
      };
    } catch {
      // Try window.name storage as final fallback before memory
      try {
        windowNameStorage.setItem('__test__', 'test');
        windowNameStorage.removeItem('__test__');
        activeStorageName = 'windowName';
        console.info('[safeStorage] Using window.name storage (persists across reloads in same tab)');
        return windowNameStorage;
      } catch {
        activeStorageName = 'memory';
        console.warn('[safeStorage] Using in-memory storage (no persistence across reloads)');
        return memoryStorage;
      }
    }
  }
}

export const safeStorage: StorageLike =
  typeof window === 'undefined' ? memoryStorage : createBrowserStorage();

export const getActiveStorageName = (): string => {
  return typeof window === 'undefined' ? 'server' : activeStorageName;
};
