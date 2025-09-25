// hooks/useWalletBalances.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useWalletBalances = () => {
  const { getWalletBalances, token } = useAuth();
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!token) {
      setError("Authentication required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const walletBalances = await getWalletBalances();
      setBalances(walletBalances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      console.error('Error fetching balances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [token]);

  return { balances, loading, error, refetch: fetchBalances };
};