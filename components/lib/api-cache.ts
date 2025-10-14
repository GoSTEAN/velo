interface CacheItem<T> {
  data: T;
  timestamp: number;
  isFetching: boolean;
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>();
  private subscribers = new Map<string, Array<(data: any) => void>>();
  private refetchIntervals = new Map<string, NodeJS.Timeout>();

  // Cache duration - 30 seconds
  private CACHE_DURATION = 30 * 1000;

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isFetching: false
    });
    this.notifySubscribers(key, data);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if cache is stale
    if (Date.now() - item.timestamp > this.CACHE_DURATION) {
      return null;
    }
    
    return item.data;
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
    
    // Return unsubscribe function
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
      subscribers.forEach(callback => callback(data));
    }
  }

  // Setup background refetching for a key
  setupBackgroundRefetch(
    key: string, 
    fetchFn: () => Promise<any>, 
    interval: number = 60000 // 1 minute default
  ): void {
    // Clear existing interval
    if (this.refetchIntervals.has(key)) {
      clearInterval(this.refetchIntervals.get(key)!);
    }

    // Setup new interval
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
    // Clear all intervals
    this.refetchIntervals.forEach(intervalId => clearInterval(intervalId));
    this.refetchIntervals.clear();
  }
}

export const dataCache = new DataCache();