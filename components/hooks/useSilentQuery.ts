import { useState, useEffect, useCallback } from 'react';

interface UseSilentQueryOptions {
  ttl?: number;
  backgroundRefresh?: boolean;
  cacheKey: string;
}

// Simple in-memory cache for this session only
const sessionCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function useSilentQuery<T>(
  fetchFn: () => Promise<T>,
  options: UseSilentQueryOptions
) {
  const { ttl = 5 * 60 * 1000, backgroundRefresh = true, cacheKey } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple cache getter
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

  // Simple cache setter
  const setCachedData = useCallback((data: T) => {
    sessionCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, [cacheKey, ttl]);

  const fetchData = useCallback(async (isBackgroundRefresh = false) => {
    try {
      const result = await fetchFn();
      
      // Cache the result
      setCachedData(result);
      
      // Update state
      setData(result);
      setError(null);
    } catch (err) {
      if (!isBackgroundRefresh) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    }
  }, [fetchFn, cacheKey, setCachedData]);

  // Initial load - completely silent
  useEffect(() => {
    const initializeData = async () => {
      
      // Check simple cache first
      const cachedData = getCachedData();
      
      if (cachedData) {
        setData(cachedData);
        
        // Always refresh in background for fresh data
        if (backgroundRefresh) {
          setTimeout(() => {
            fetchData(true);
          }, 2000);
        }
      } else {
        // No cache - fetch immediately
        await fetchData(true);
      }
    };

    initializeData();
  }, [fetchData, cacheKey, backgroundRefresh, ttl, getCachedData]);

  // Background refresh interval
  useEffect(() => {
    if (!backgroundRefresh) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData(true);
      }
    }, 20000); 

    return () => {
      clearInterval(interval);
    };
  }, [fetchData, backgroundRefresh]);

  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return {
    data,
    error,
    refetch,
  };
}