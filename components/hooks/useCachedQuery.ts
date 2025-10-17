import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface UseCachedQueryOptions {
  ttl?: number; // Cache time-to-live in ms
  backgroundRefresh?: boolean;
}

export function useCachedQuery<T>(
  queryKey: string,
  fetchFn: () => Promise<T>,
  options: UseCachedQueryOptions = {}
) {
  const { ttl = 5 * 60 * 1000, backgroundRefresh = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const fetchData = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setIsInitializing(true);
    }

    try {
      // Try cache first (apiClient handles this internally)
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      if (!isBackgroundRefresh) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
      console.error(`Error fetching ${queryKey}:`, err);
    } finally {
      if (!isBackgroundRefresh) {
        setIsInitializing(false);
      }
    }
  }, [fetchFn, queryKey]);

  // Initial load - silent if cache exists
  useEffect(() => {
    const initializeData = async () => {
      // Check if we have cached data
      const cachedData = apiClient.getCachedData<T>(queryKey);
      
      if (cachedData) {
        setData(cachedData);
        setIsInitializing(false);
        
        // Still refresh in background if data might be stale
        if (backgroundRefresh) {
          fetchData(true);
        }
      } else {
        // No cache, need to fetch
        await fetchData(false);
      }
    };

    initializeData();
  }, [fetchData, queryKey, backgroundRefresh]);

  // Background refresh interval
  useEffect(() => {
    if (!backgroundRefresh) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData(true);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [fetchData, backgroundRefresh]);

  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return {
    data,
    error,
    isInitializing, // Only true on very first load when no cache exists
    refetch,
  };
}