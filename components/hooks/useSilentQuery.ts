import { useState, useEffect, useCallback, useRef } from "react";

interface UseSilentQueryOptions {
  ttl?: number;
  backgroundRefresh?: boolean;
  cacheKey: string;
}

// Simple in-memory cache (per session)
const sessionCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

export function useSilentQuery<T>(
  fetchFn: () => Promise<T>,
  options: UseSilentQueryOptions
) {
  const { ttl = 5 * 60 * 1000, backgroundRefresh = true, cacheKey } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Cleanup flag to prevent state update on unmounted component
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /** 🔹 Get cached data safely */
  const getCachedData = useCallback((): T | null => {
    const cached = sessionCache.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      sessionCache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }, [cacheKey]);

  /** 🔹 Store data in cache */
  const setCachedData = useCallback(
    (data: T) => {
      sessionCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl,
      });
    },
    [cacheKey, ttl]
  );

  /** 🔹 Fetch fresh data */
  const fetchData = useCallback(
    async (isBackgroundRefresh = false) => {
      try {
        const result = await fetchFn();
        setCachedData(result);

        // Avoid state updates if unmounted
        if (!mountedRef.current) return;

        setData(result);
        setError(null);
      } catch (err) {
        if (!mountedRef.current) return;
        if (!isBackgroundRefresh) {
          setError(err instanceof Error ? err.message : "Failed to fetch data");
        }
      }
    },
    [fetchFn, setCachedData]
  );

  /** 🔹 Initialize once on mount */
  useEffect(() => {
    const initializeData = async () => {
      const cachedData = getCachedData();

      if (cachedData) {
        setData(cachedData);

        if (backgroundRefresh) {
          // silent refresh after 2s
          setTimeout(() => {
            fetchData(true);
          }, 2000);
        }
      } else {
        await fetchData(true);
      }
    };

    initializeData();
    // ✅ Only depend on stable inputs
  }, [cacheKey, backgroundRefresh, getCachedData, fetchData]);

  /** 🔹 Background refresh every 20s (if enabled) */
  useEffect(() => {
    if (!backgroundRefresh) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData(true);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [fetchData, backgroundRefresh]);

  /** 🔹 Manual refetch */
  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return { data, error, refetch };
}
