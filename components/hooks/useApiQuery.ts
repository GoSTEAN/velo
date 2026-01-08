import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { StorageManager, getMemoryCache, setMemoryCache } from '@/lib/utils/storage-utils';
import { useAuth } from '@/components/context/AuthContext';

interface UseApiQueryOptions {
  ttl?: number;
  backgroundRefresh?: boolean;
  cacheKey: string;
  requireAuth?: boolean;
}

export function useApiQuery<T>(
  fetchFn: () => Promise<T>,
  options: UseApiQueryOptions
) {
  const {
    ttl = 5 * 60 * 1000,
    backgroundRefresh = true,
    cacheKey,
    requireAuth = true,
  } = options;

  const { token } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchFnRef = useRef(fetchFn);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (isBackgroundRefresh = false) => {
      if (requireAuth && !token) {
        if (!isBackgroundRefresh) {
          setError('Authentication required');
          setIsLoading(false);
        }
        return;
      }

      if (!isBackgroundRefresh) {
        setIsLoading(true);
      }

      try {
        const result = await fetchFnRef.current();
        
        // Update caches
        setMemoryCache(cacheKey, result, ttl);
        StorageManager.set(cacheKey, result);
        
        if (!mountedRef.current) return;
        
        setData(result);
        setError(null);
      } catch (err) {
        if (!mountedRef.current) return;
        
        if (!isBackgroundRefresh) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
        console.error(`Error fetching ${cacheKey}:`, err);
      } finally {
        if (!isBackgroundRefresh) {
          setIsLoading(false);
        }
      }
    },
    [token, cacheKey, ttl, requireAuth]
  );

  const initializeData = useCallback(async () => {
    // Try memory cache first
    const memoryCached = getMemoryCache<T>(cacheKey);
    if (memoryCached) {
      setData(memoryCached);
      setIsLoading(false);
      
      if (backgroundRefresh) {
        setTimeout(() => fetchData(true), 2000);
      }
      return;
    }

    // Try storage cache
    const storageCached = StorageManager.get<T>(cacheKey);
    if (storageCached) {
      setData(storageCached);
      setIsLoading(false);
      
      if (backgroundRefresh) {
        setTimeout(() => fetchData(true), 2000);
      }
      return;
    }

    // No cache - fetch fresh
    await fetchData(false);
  }, [cacheKey, fetchData, backgroundRefresh]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (!backgroundRefresh) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData(true);
      }
    }, 120000); // Increased from 30 seconds to 2 minutes

    return () => clearInterval(interval);
  }, [fetchData, backgroundRefresh]);

  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return { data, error, isLoading, refetch };
}