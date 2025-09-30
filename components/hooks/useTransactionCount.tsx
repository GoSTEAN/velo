// hooks/useTransactionCount.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/context/AuthContext';

export function useTransactionCount() {
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getTransactionHistory, token } = useAuth();

  useEffect(() => {
    const fetchTransactionCount = async () => {
      // Don't fetch if there's no token
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the first page to get pagination info
        const response = await getTransactionHistory(1, 1);
        
        // The total count is in the pagination object
        const totalCount = response.pagination.total;
        
        setTransactionCount(totalCount);
      } catch (err) {
        console.error('Error fetching transaction count:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        setTransactionCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionCount();
  }, [getTransactionHistory, token]);

  return { transactionCount, loading, error };
}