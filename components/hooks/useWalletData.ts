import { useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/context/AuthContext';
import { WalletAddress, WalletBalance } from '@/types/authContext';
import useExchangeRates from './useExchangeRate';
import { useSilentQuery } from './useSilentQuery';

interface BalanceBreakdown {
  chain: string;
  symbol: string;
  balance: number;
  ngnValue: number;
  rate: number | null;
}

interface WalletData {
  addresses: WalletAddress[];
  balances: WalletBalance[];
  breakdown: BalanceBreakdown[];
  totalNGN: number;
  totalBalance: number;
  error: string | null;
  refetch: () => Promise<void>;
  isLoading: boolean; 
}

export const useWalletData = (): WalletData => {
  const { token } = useAuth();
  const { rates, isLoading: ratesLoading } = useExchangeRates();

  // Test if API client methods work
  const testAPICall = useCallback(async () => {
    try {
      const result = await apiClient.getWalletAddresses();
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // Use silent queries
  const { 
    data: addressesData, 
    error: addressesError, 
    refetch: refetchAddresses 
  } = useSilentQuery(
    async () => {
      try {
        const result = await apiClient.getWalletAddresses();
        return result;
      } catch (error) {
        throw error;
      }
    },
    { 
      cacheKey: 'wallet-addresses',
      ttl: 10 * 60 * 1000,
      backgroundRefresh: true 
    }
  );

  const { 
    data: balancesData, 
    error: balancesError, 
    refetch: refetchBalances 
  } = useSilentQuery(
    async () => {
      try {
        const result = await apiClient.getWalletBalances();
        return result;
      } catch (error) {
        throw error;
      }
    },
    { 
      cacheKey: 'wallet-balances',
      ttl: 2 * 60 * 1000,
      backgroundRefresh: true 
    }
  );


  // SAFE data processing
  const addresses = useMemo(() => {
    let result: WalletAddress[] = [];
    
    if (Array.isArray(addressesData)) {
      result = addressesData;
    } else if (addressesData && typeof addressesData === 'object') {
      // Handle case where API returns { addresses: [] }
      result = (addressesData as any).addresses || [];
    }
    
    return result;
  }, [addressesData]);

  const balances = useMemo(() => {
    let result: WalletBalance[] = [];
    
    if (Array.isArray(balancesData)) {
      result = balancesData;
    } else if (balancesData && typeof balancesData === 'object') {
      // Handle case where API returns { balances: [] }
      result = (balancesData as any).balances || [];
    }
    
    return result;
  }, [balancesData]);

  // Debug: expose raw and normalized wallet data to the console to help diagnose
  // missing tokens in the dropdown (temporary; remove after debugging).
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug('useWalletData: raw', { addressesData, balancesData });
    // eslint-disable-next-line no-console
    console.debug('useWalletData: normalized', { addresses, balances });
  }

  const error = addressesError || balancesError;

  // Map symbols to rate keys
  const getRateKey = useCallback((symbol: string): keyof typeof rates => {
    const symbolMap: { [key: string]: keyof typeof rates } = {
      'ETH': 'ETH', 'BTC': 'BTC', 'SOL': 'SOL', 'STRK': 'STRK',
      'USDT': 'USDT', 'USDC': 'USDC', 'DOT': 'DOT', 'XLM': 'XML'
    };
    return symbolMap[symbol] || 'USDT';
  }, []);

  // Calculate breakdown
  const { breakdown, totalNGN } = useMemo(() => {
    
    if (!Array.isArray(balances) || balances.length === 0) {
      return { breakdown: [], totalNGN: 0 };
    }

    try {
      const breakdownResult = balances.map(balance => {
        const rateKey = getRateKey(balance.symbol || 'USDT');
        const rate = rates[rateKey] || 1;
        const numericBalance = parseFloat(balance.balance || "0") || 0;
        const ngnValue = numericBalance * rate;

        return {
          chain: balance.chain || 'unknown',
          symbol: balance.symbol || 'UNKNOWN',
          balance: numericBalance,
          ngnValue,
          rate
        };
      });

      const totalNGN = breakdownResult.reduce((sum, item) => sum + item.ngnValue, 0);
      
      return {
        breakdown: breakdownResult,
        totalNGN
      };
    } catch (err) {
      console.error('Breakdown calculation error:', err);
      return { breakdown: [], totalNGN: 0 };
    }
  }, [balances, rates, getRateKey]);

  // Manual refetch
  const refetch = useCallback(async () => {
    if (!token) {
      console.warn(' No token for refetch');
      return;
    }
    
    try {
      await Promise.all([refetchAddresses(), refetchBalances()]);
    } catch (err) {
      console.error(' Manual refetch failed:', err);
    }
  }, [token, refetchAddresses, refetchBalances]);

  // Temporary loading state for debugging
  const isLoading = !addressesData && !balancesData && !error;


  return {
    addresses,
    balances,
    breakdown,
    totalNGN,
    totalBalance: totalNGN,
    error,
    refetch,
    isLoading 
  };
};