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



  // Use silent queries
  const { 
    data: addressesData, 
    error: addressesError, 
    refetch: refetchAddresses 
  } = useSilentQuery(
    async () => {
      try {
        const result = await apiClient.getWalletAddresses();
        const wallets = result.filter(address => address.chain !== "usdt_trc20")
        // console.log("filleterd wallets data",wallets)
        return wallets;
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
        const wallets = result.filter(address => address.chain !== "usdt_trc20")
        // console.log("fileterd balance", wallets)
        return wallets;
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

  // Fast-path: read a lightweight cached copy from sessionStorage so the UI
  // can render balances immediately on cold reload while network fetch runs.
  // Keys are namespaced to avoid collision and are optional.
  const readFallback = <T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      return null;
    }
  };

  const fallbackAddresses = readFallback<any[]>('velo.wallet.addresses');
  const fallbackBalances = readFallback<any[]>('velo.wallet.balances');


  // SAFE data processing
  const addresses = useMemo(() => {
    let result: WalletAddress[] = [];
    // Prefer live query data, but fall back to sessionStorage cache so the UI
    // can show something instantly while the background fetch completes.
    if (Array.isArray(addressesData)) {
      result = addressesData;
    } else if (addressesData && typeof addressesData === 'object') {
      result = (addressesData as any).addresses || [];
    } else if (Array.isArray(fallbackAddresses)) {
      result = fallbackAddresses;
    }
    
    return result;
  }, [addressesData]);

  const balances = useMemo(() => {
    let result: WalletBalance[] = [];
    // Prefer live query balances, then fallback to session cache if available.
    if (Array.isArray(balancesData)) {
      result = balancesData;
    } else if (balancesData && typeof balancesData === 'object') {
      result = (balancesData as any).balances || [];
    } else if (Array.isArray(fallbackBalances)) {
      result = fallbackBalances;
    }
    
    return result;
  }, [balancesData]);

  // Debug: expose raw and normalized wallet data to the console to help diagnose
  // missing tokens in the dropdown (temporary; remove after debugging).
  if (typeof window !== 'undefined') {
    console.debug('useWalletData: raw', { addressesData, balancesData });
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
      // Persist fresh results (if available) to sessionStorage for instant
      // render on next load. We read the live query variables which will be
      // updated by the refetch calls above.
      try {
        if (typeof window !== 'undefined') {
          if (addressesData) sessionStorage.setItem('velo.wallet.addresses', JSON.stringify(addressesData));
          if (balancesData) sessionStorage.setItem('velo.wallet.balances', JSON.stringify(balancesData));
        }
      } catch (e) {
        // ignore storage failures
      }
    } catch (err) {
      console.error(' Manual refetch failed:', err);
    }
  }, [token, refetchAddresses, refetchBalances]);

  // Persist any fresh query data to sessionStorage as soon as it's available so
  // subsequent navigations/read reloads display instantly.
  if (typeof window !== 'undefined') {
    try {
      if (addressesData) sessionStorage.setItem('velo.wallet.addresses', JSON.stringify(addressesData));
      if (balancesData) sessionStorage.setItem('velo.wallet.balances', JSON.stringify(balancesData));
    } catch (e) {
      // ignore quota/storage issues
    }
  }

  // Temporary loading state for debugging
  const isLoading = !addressesData && !balancesData && !error;

  // console.log("breakdown ", breakdown)

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