// hooks/useTotalBalance.ts (Improved)
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useExchangeRates from "./useExchangeRate";

interface BalanceBreakdown {
  chain: string;
  symbol: string;
  balance: number;
  ngnValue: number;
  rate: number | null;
}

interface BalanceSummary {
  totalNGN: number;
  breakdown: BalanceBreakdown[];
}

export const useTotalBalance = () => {
  const { getWalletBalances, token } = useAuth();
  const { rates } = useExchangeRates();
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>({
    totalNGN: 0,
    breakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map symbols to rate keys
  const getRateKey = useCallback((symbol: string): keyof typeof rates => {
    const symbolMap: { [key: string]: keyof typeof rates } = {
      'ETH': 'ETH',
      'BTC': 'BTC', 
      'SOL': 'SOL',
      'STRK': 'STRK',
      'USDT': 'USDT',
      'USDC': 'USDC',
      'DOT': 'DOT',
      'XLM': 'XML'
    };
    return symbolMap[symbol] || 'USDT';
  }, []);

  const calculateTotalBalance = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const balances = await getWalletBalances();
      
      const breakdown = balances.map(balance => {
        const rateKey = getRateKey(balance.symbol);
        const rate = rates[rateKey] || 1;
        const numericBalance = parseFloat(balance.balance) || 0;
        const ngnValue = numericBalance * rate;

        return {
          chain: balance.chain,
          symbol: balance.symbol,
          balance: numericBalance,
          ngnValue,
          rate
        };
      });

      const totalNGN = breakdown.reduce((sum, item) => sum + item.ngnValue, 0);

      setBalanceSummary({
        totalNGN,
        breakdown
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate balance');
      console.error('Error calculating total balance:', err);
    } finally {
      setLoading(false);
    }
  }, [token, getWalletBalances, rates, getRateKey]);

  useEffect(() => {
    if (token && rates.ETH !== null) {
      calculateTotalBalance();
    }
  }, [token, rates.ETH, calculateTotalBalance]);

  return {
    totalBalance: balanceSummary.totalNGN,
    breakdown: balanceSummary.breakdown,
    loading,
    error,
    refetch: calculateTotalBalance
  };
};