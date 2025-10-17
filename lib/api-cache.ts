interface CacheItem<T> {
  data: T;
  timestamp: number;
  isFetching: boolean;
  ttl?: number; 
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>();
  private subscribers = new Map<string, Array<(data: any) => void>>();
  private refetchIntervals = new Map<string, NodeJS.Timeout>();
  private DEFAULT_CACHE_DURATION = 30 * 1000;
  private STORAGE_KEY = "velo-persistent-cache";

  constructor() {
    this.loadPersistentCache();
  }

  private loadPersistentCache() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const cacheData = JSON.parse(stored);
        const now = Date.now();

        Object.entries(cacheData).forEach(([key, item]: [string, any]) => {
          const cacheDuration = item.ttl || this.DEFAULT_CACHE_DURATION;
          // Only load non-expired items
          if (now - item.timestamp < cacheDuration) {
            this.cache.set(key, {
              data: item.data,
              timestamp: item.timestamp,
              isFetching: false,
              ttl: item.ttl,
            });
          }
        });
        console.log("📦 Loaded persistent cache:", this.cache.size, "items");
      }
    } catch (error) {
      console.warn("Failed to load cache from localStorage:", error);
    }
  }

  private saveToPersistentCache() {
    if (typeof window === "undefined") return;

    try {
      const cacheObj: Record<string, any> = {};
      this.cache.forEach((value, key) => {
        cacheObj[key] = {
          data: value.data,
          timestamp: value.timestamp,
          ttl: value.ttl,
        };
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.warn("Failed to save cache to localStorage:", error);
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isFetching: false,
      ttl,
    });
    // Auto-save
    this.saveToPersistentCache();
    this.notifySubscribers(key, data);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const cacheDuration = item.ttl || this.DEFAULT_CACHE_DURATION;
    if (Date.now() - item.timestamp > cacheDuration) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    // Auto-save on delete
    this.saveToPersistentCache();
  }

  invalidateCache(keys: string[]): void {
    keys.forEach((key) => this.delete(key));
  }

  isFetching(key: string): boolean {
    return this.cache.get(key)?.isFetching || false;
  }

  setFetching(key: string, fetching: boolean): void {
    const existing = this.cache.get(key);
    if (existing) {
      this.cache.set(key, { ...existing, isFetching: fetching });
    }
  }

  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }

    const subscribers = this.subscribers.get(key)!;
    subscribers.push(callback);

    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers<T>(key: string, data: T): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => callback(data));
    }
  }

  setupBackgroundRefetch(
    key: string,
    fetchFn: () => Promise<any>,
    interval: number = 60000
  ): void {
    if (this.refetchIntervals.has(key)) {
      clearInterval(this.refetchIntervals.get(key)!);
    }

    const intervalId = setInterval(async () => {
      try {
        this.setFetching(key, true);
        const data = await fetchFn();
        this.set(key, data);
      } catch (error) {
        console.error(`Background refetch failed for ${key}:`, error);
      } finally {
        this.setFetching(key, false);
      }
    }, interval);

    this.refetchIntervals.set(key, intervalId);
  }

  clear(): void {
    this.cache.clear();
    this.refetchIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.refetchIntervals.clear();

    // NEW: Clear persistent storage too
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

export const dataCache = new DataCache();
