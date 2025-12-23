import { useCallback } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { normalizeChain, getTokenSymbol } from '@/lib/utils/token-utils';

export const useCommonOperations = () => {
  const { token } = useAuth();

  const requireAuth = useCallback(() => {
    if (!token) throw new Error('Authentication required');
    return token;
  }, [token]);

  const formatBalance = useCallback((balance: number): string => {
    if (balance === 0) return "0.00";
    if (balance < 0.001) return "<0.001";
    return balance.toFixed(4);
  }, []);

  const formatNGN = useCallback((amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const shortenAddress = useCallback((address: string, chars = 8): string => {
    if (!address || address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }, []);

  return {
    requireAuth,
    formatBalance,
    formatNGN,
    shortenAddress,
    normalizeChain,
    getTokenSymbol,
    isAuthenticated: !!token,
  };
};