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
  // Keep a ref to the latest fetchFn so callers can pass inline functions
  // without causing this hook to re-create callbacks on every render.
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

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
        // call the latest fetchFn from ref to avoid recreating this callback
        const result = await fetchFnRef.current();
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
    [setCachedData]
  );

  /** 🔹 Initialize once on mount */
  useEffect(() => {
    const initializeData = async () => {
      const cachedData = getCachedData();
      // If the app is initializing auth, defer fetches until auth is ready.
      const isInitializing = typeof window !== "undefined" && (window as any).__VELO_AUTH_INITIALIZING;

      if (cachedData) {
        setData(cachedData);

        if (backgroundRefresh) {
          // If auth is initializing, subscribe to the auth-ready event and
          // perform background refresh once initialization completes. Otherwise
          // schedule a silent refresh after 2s.
          if (isInitializing && typeof window !== "undefined") {
            const onReady = () => {
              try {
                fetchData(true);
              } catch (e) {
                /* ignore */
              }
              window.removeEventListener("velo:authReady", onReady);
            };
            window.addEventListener("velo:authReady", onReady);
          } else {
            setTimeout(() => {
              fetchData(true);
            }, 2000);
          }
        }
      } else {
        // No cached data: start background fetch only if auth init is finished.
        if (isInitializing) {
          // wait for auth to finish, then fetch
          if (typeof window !== "undefined") {
            const onReady = () => {
              try {
                void fetchData(true);
              } catch (e) {
                /* ignore */
              }
              window.removeEventListener("velo:authReady", onReady);
            };
            window.addEventListener("velo:authReady", onReady);
          }
        } else {
          // Start background fetch but don't await it so the UI isn't blocked
          // on first mount when no cache exists. Components should provide a
          // sessionStorage fallback or loading UI for the very first render.
          void fetchData(true);
        }
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
