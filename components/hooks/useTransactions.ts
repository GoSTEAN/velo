import { useState, useCallback, useMemo, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/context/AuthContext';
import { Transaction, TransactionHistoryResponse } from '@/types/authContext';
import { useApiQuery } from './useApiQuery';

interface UseTransactionsParams {
  page?: number;
  limit?: number;
  chain?: string;
  type?: string;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  pagination: any;
  error: string | null;
  refetch: (params?: UseTransactionsParams) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const defaultPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
};

export const useTransactions = (initialParams: UseTransactionsParams = {}): UseTransactionsReturn => {
  const { token } = useAuth();
  const [params, setParams] = useState(initialParams);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [currentPagination, setCurrentPagination] = useState(defaultPagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // Main query for initial transactions
  const { 
    data: transactionsData, 
    error: transactionsError, 
    refetch: refetchTransactions 
  } = useApiQuery(
    () => apiClient.getTransactionHistory({ ...params, page: 1 }),
    { 
      cacheKey: `transactions-${JSON.stringify({ ...params, page: 1 })}`,
      // Increase the hook-level TTL to align with api-client and improve cache hits
      ttl: 5 * 60 * 1000,
      backgroundRefresh: true 
    }
  );

  // Fast-path: try to read cached transactions from apiClient cache or sessionStorage
  useEffect(() => {
    const pageKey = `transactions-${JSON.stringify({ ...params, page: 1 })}`;
    const allKey = `transactions-all`;
    // 1) Try apiClient cache
    try {
      // Prefer a full cached snapshot if available
      const cachedAll = apiClient.getCachedData<any>(allKey);
      if (cachedAll && Array.isArray(cachedAll.transactions)) {
        setAllTransactions(cachedAll.transactions);
        setCurrentPagination({ page: 1, limit: cachedAll.pagination?.limit || cachedAll.transactions.length, total: cachedAll.pagination?.total || cachedAll.transactions.length, totalPages: 1 });
        return;
      }

      const cached = apiClient.getCachedData<any>(pageKey);
      if (cached && Array.isArray(cached.transactions)) {
        setAllTransactions(cached.transactions);
        setCurrentPagination(cached.pagination || defaultPagination);
        return;
      }
    } catch (e) {
      // ignore
    }

    // 2) Try sessionStorage fallback
    if (typeof window !== 'undefined') {
      try {
        // First check for a full prefetch snapshot
        const rawAll = sessionStorage.getItem(allKey);
        if (rawAll) {
          const parsedAll = JSON.parse(rawAll);
          if (parsedAll && Array.isArray(parsedAll.transactions)) {
            setAllTransactions(parsedAll.transactions);
            setCurrentPagination({ page: 1, limit: parsedAll.pagination?.limit || parsedAll.transactions.length, total: parsedAll.pagination?.total || parsedAll.transactions.length, totalPages: 1 });
            return;
          }
        }

        const raw = sessionStorage.getItem(pageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.transactions)) {
            setAllTransactions(parsed.transactions);
            setCurrentPagination(parsed.pagination || defaultPagination);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [params]);

  // Initialize or reset data when main query changes
  useEffect(() => {
    if (transactionsData) {
      const newTransactions = Array.isArray(transactionsData.transactions) 
        ? transactionsData.transactions 
        : [];
      
      const newPagination = transactionsData.pagination || defaultPagination;
      
      // Always replace data when main query updates (refetch or params change)
      setAllTransactions(newTransactions);
      setCurrentPagination(newPagination);
      // Persist a lightweight copy for instant render on next navigation
      try {
        if (typeof window !== 'undefined') {
          const key = `transactions-${JSON.stringify({ ...params, page: 1 })}`;
          sessionStorage.setItem(key, JSON.stringify({ transactions: newTransactions, pagination: newPagination }));
        }
      } catch (e) {
        // ignore storage errors
      }
      
    }
  }, [transactionsData]);

  // Refetch function
  const refetch = useCallback(async (newParams?: UseTransactionsParams) => {
    setLoadMoreError(null);
    if (newParams) {
      setParams(newParams);
    }
    await refetchTransactions();
  }, [refetchTransactions]);

  // Load More function - COMPLETE IMPLEMENTATION
  const loadMore = useCallback(async () => {
    if (!token) {
      console.warn('No token available for loadMore');
      return;
    }

    if (currentPagination.page >= currentPagination.totalPages) {
      console.log(' Reached last page - no more transactions to load');
      return;
    }

    if (isLoadingMore) {
      return;
    }

    try {
      setIsLoadingMore(true);
      setLoadMoreError(null);
      
      const nextPage = currentPagination.page + 1;
      const loadMoreParams = {
        ...params,
        page: nextPage,
      };

      console.log(`📄 Loading page ${nextPage} of ${currentPagination.totalPages}`);

      // Fetch next page directly
      const response = await apiClient.getTransactionHistory(loadMoreParams);
      
      const newTransactions = Array.isArray(response?.transactions) 
        ? response.transactions 
        : [];
      
      const newPagination = response?.pagination || {
        ...currentPagination,
        page: nextPage
      };


      // Append new transactions to existing ones
      setAllTransactions(prev => {
        const combinedTransactions = [...prev, ...newTransactions];
        return combinedTransactions;
      });

      // Update pagination with the new page info
      setCurrentPagination(newPagination);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more transactions';
      console.error(' Load more error:', errorMessage);
      setLoadMoreError(errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [token, currentPagination, params, isLoadingMore]);

  // Combine errors
  const error = transactionsError || loadMoreError;
  const hasMore = currentPagination.page < currentPagination.totalPages;

  return {
    transactions: allTransactions,
    pagination: currentPagination,
    error,
    refetch,
    loadMore,
    hasMore,
    isLoadingMore,
  };
};