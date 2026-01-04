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
  limit: 50,
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

  // Sync params with props
  useEffect(() => {
    setParams(prev => {
      // Only update if actually different to avoid loops
      if (
        prev.page === initialParams.page &&
        prev.limit === initialParams.limit &&
        prev.chain === initialParams.chain &&
        prev.type === initialParams.type
      ) {
        return prev;
      }
      return { ...prev, ...initialParams };
    });
  }, [initialParams.page, initialParams.limit, initialParams.chain, initialParams.type]);

  // Main query for initial transactions
  const {
    data: transactionsData,
    error: transactionsError,
    refetch: refetchTransactions
  } = useApiQuery(
    () => apiClient.getTransactionHistory(params),
    {
      cacheKey: `transactions-${JSON.stringify(params)}`,
      // Increase the hook-level TTL to align with api-client and improve cache hits
      ttl: 5 * 60 * 1000,
      backgroundRefresh: true
    }
  );

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