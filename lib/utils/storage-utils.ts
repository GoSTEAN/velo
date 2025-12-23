// Single source for all storage operations
export class StorageManager {
  private static readonly PREFIX = 'velo';
  
  static get<T>(key: string, fallback: T | null = null): T | null {
    if (typeof window === 'undefined') return fallback;
    
    try {
      const fullKey = `${this.PREFIX}.${key}`;
      const raw = sessionStorage.getItem(fullKey);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return fallback;
    }
  }
  
  static set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      const fullKey = `${this.PREFIX}.${key}`;
      sessionStorage.setItem(fullKey, JSON.stringify(value));
    } catch (e) {
      console.error(`Error storing ${key} in storage:`, e);
    }
  }
  
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const fullKey = `${this.PREFIX}.${key}`;
      sessionStorage.removeItem(fullKey);
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e);
    }
  }
  
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(`${this.PREFIX}.`)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }
}

// Memory cache (replace duplicate implementations)
export const memoryCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

export const getMemoryCache = <T>(key: string): T | null => {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > cached.ttl;
  if (isExpired) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.data;
};

export const setMemoryCache = <T>(key: string, data: T, ttl: number): void => {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};