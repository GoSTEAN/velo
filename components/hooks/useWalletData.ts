import { useMemo } from 'react';
import { useAuthQuery } from './useAuthQuery';
import { normalizeChain, getTokenSymbol, getRateKey } from '@/lib/utils/token-utils';
import useExchangeRates from './useExchangeRate';
import { apiClient } from '@/lib/api-client';

export const useWalletData = () => {
  const { data: addressesData, ...addressesRest } = useAuthQuery(
    () => apiClient.getWalletAddresses(),
    {
      cacheKey: 'wallet-addresses',
      ttl: 60 * 60 * 1000, // Match apiClient TTL
      backgroundRefresh: false // Addresses rarely change, no need to poll
    }
  );

  const { data: balancesData, ...balancesRest } = useAuthQuery(
    () => apiClient.getWalletBalances(),
    {
      cacheKey: 'wallet-balances',
      ttl: 5 * 60 * 1000, // Increased from 2 minutes to 5 minutes
      backgroundRefresh: false // Disabled background refresh for balances
    }
  );

  const { rates } = useExchangeRates();

  // Simplified processing - logic moved to utils
  const addresses = addressesData || [];
  const balances = useMemo(() => {
    if (!balancesData) return [];
    
    console.log('Raw balances data:', balancesData); // Debug logging
    
    // Filter out balances with missing symbol or null balance values from failed fetches
    const filtered = balancesData.filter(balance => {
      return balance.symbol && balance.balance !== null && balance.balance !== undefined;
    });
    
    console.log('Filtered balances:', filtered); // Debug logging
    return filtered;
  }, [balancesData]);

  // Calculate breakdown using shared utilities
  const breakdown = useMemo(() => balances.map(balance => {
    // Use the symbol from the balance object (backend provides this)
    // Fall back to deriving from chain if symbol is missing
    let symbol = balance.symbol;
    if (!symbol) {
      // Derive symbol from chain if not provided by backend
      const chainNormalized = normalizeChain(balance.chain);
      symbol = getTokenSymbol(chainNormalized);
    }
    
    const rateKey = getRateKey(symbol);
    const rate = rates[rateKey] || 1;
    const numericBalance = parseFloat(balance.balance || "0") || 0;
    const ngnValue = numericBalance * rate;

    return {
      chain: balance.chain || 'unknown',
      network: balance.network || 'mainnet',
      symbol: symbol || 'UNKNOWN',
      balance: numericBalance,
      ngnValue,
      rate
    };
  }), [balances, rates]);

  const totalNGN = useMemo(() => breakdown.reduce((sum: number, item: any) => sum + item.ngnValue, 0), [breakdown]);

  return useMemo(() => ({
    addresses,
    balances,
    breakdown,
    totalNGN,
    totalBalance: totalNGN,
    error: addressesRest.error || balancesRest.error,
    refetch: async () => {
      await Promise.all([addressesRest.refetch(), balancesRest.refetch()]);
    },
    isLoading: addressesRest.isLoading || balancesRest.isLoading,
  }), [addresses, balances, breakdown, totalNGN, addressesRest.error, balancesRest.error, addressesRest.isLoading, balancesRest.isLoading, addressesRest.refetch, balancesRest.refetch, rates]);
};