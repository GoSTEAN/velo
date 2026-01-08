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
  const balances = balancesData || [];

  // Calculate breakdown using shared utilities
  const breakdown = useMemo(() => balances.map(balance => {
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
  }), [addresses, balances, breakdown, totalNGN, addressesRest.error, balancesRest.error, addressesRest.isLoading, balancesRest.isLoading, addressesRest.refetch, balancesRest.refetch]);
};