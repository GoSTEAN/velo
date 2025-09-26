// hooks/useTotalBalance.ts
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useExchangeRates from "./useExchangeRate";

interface BalanceSummary {
  totalNGN: number;
  breakdown: {
    chain: string;
    symbol: string;
    balance: number;
    ngnValue: number;
    rate: number | null;
  }[];
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
  const getRateKey = (symbol: string): keyof typeof rates => {
    const symbolMap: { [key: string]: keyof typeof rates } = {
      'ETH': 'ETH',
      'BTC': 'BTC', 
      'SOL': 'SOL',
      'STRK': 'STRK',
      'USDT': 'USDT',
      'USDC': 'USDC'
    };
    return symbolMap[symbol] || 'NGN';
  };

  const calculateTotalBalance = async () => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const balances = await getWalletBalances();
      
      console.log(balances)
      const breakdown = balances.map(balance => {
        const rateKey = getRateKey(balance.symbol);
        const rate = rates[rateKey] || 1; // Default to 1 if rate not found
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
  };

  useEffect(() => {
    if (token && rates.ETH !== null) { // Wait for rates to load
      calculateTotalBalance();
    }
  }, [token, rates.ETH]); // Recalculate when rates change

  return {
    totalBalance: balanceSummary.totalNGN,
    breakdown: balanceSummary.breakdown,
    loading,
    error,
    refetch: calculateTotalBalance
  };
};