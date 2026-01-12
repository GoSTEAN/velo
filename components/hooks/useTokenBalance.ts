import { useMemo, useCallback } from 'react';
import { useApiQuery } from './useApiQuery';
import  useExchangeRates  from '@/components/hooks/useExchangeRate';
import { 
  normalizeChain, 
  getTokenSymbol, 
  getTokenName,
  getRateKey,
  formatTokenAmount 
} from '@/lib/utils/token-utils';
import { apiClient } from '@/lib/api-client';

export interface TokenInfo {
  chain: string;
  name: string;
  symbol: string;
  address: string;
  network: string;
  balance: number;
  ngnValue: number;
  hasWallet: boolean;
  rate: number;
}

export function useTokenBalance() {
  // Fetch addresses using useApiQuery (handles caching, loading, errors automatically)
  const { 
    data: addressesData, 
    isLoading: addressesLoading, 
    error: addressesError, 
    refetch: refetchAddresses 
  } = useApiQuery(
    () => apiClient.getWalletAddresses(),
    { cacheKey: 'wallet-addresses', ttl: 10 * 60 * 1000 }
  );
  
  // Fetch balances using useApiQuery
  const { 
    data: balancesData, 
    isLoading: balancesLoading, 
    error: balancesError, 
    refetch: refetchBalances 
  } = useApiQuery(
    () => apiClient.getWalletBalances(),
    { cacheKey: 'wallet-balances', ttl: 30 * 1000 } // 30 seconds for faster balance updates
  );
  
  // Get exchange rates
  const { rates } = useExchangeRates();
  
  // Normalize data - safe defaults
  const addresses = addressesData || [];
  const balances = balancesData || [];

  // Get token rate from exchange rates
  const getTokenRate = useCallback((symbol: string): number => {
    const rateKey = getRateKey(symbol);
    const rate = rates[rateKey as keyof typeof rates];
    return typeof rate === 'number' ? rate : 1;
  }, [rates]);

  // MAIN COMPUTATION: Build unified token info
  const availableTokens = useMemo((): TokenInfo[] => {
    if (!addresses.length && !balances.length) return [];

    const tokenMap = new Map<string, TokenInfo>();

    // Process addresses
    addresses.forEach(addr => {
      const chainKey = normalizeChain(addr.chain);
      if (!chainKey) return;

      const symbol = getTokenSymbol(chainKey);
      const rate = getTokenRate(symbol);
      
      tokenMap.set(chainKey, {
        chain: chainKey,
        name: getTokenName(chainKey),
        symbol,
        address: addr.address,
        network: addr.network || 'testnet',
        balance: 0, // Will be updated from balances
        ngnValue: 0,
        hasWallet: true,
        rate,
      });
    });

    // Process balances and merge
    balances.forEach(bal => {
      const chainKey = normalizeChain(bal.chain) || normalizeChain(bal.symbol);
      if (!chainKey) return;

      const symbol = bal.symbol || getTokenSymbol(chainKey);
      const balance = parseFloat(bal.balance || '0');
      const rate = getTokenRate(symbol);
      const ngnValue = balance * rate;

      const existing = tokenMap.get(chainKey);
      
      if (existing) {
        // Update existing token
        existing.balance = balance;
        existing.ngnValue = ngnValue;
        existing.rate = rate;
        // If balance record has address but addresses array doesn't
        if (!existing.address && bal.address) {
          existing.address = bal.address;
          existing.hasWallet = true;
        }
      } else {
        // Create new token entry
        tokenMap.set(chainKey, {
          chain: chainKey,
          name: getTokenName(chainKey),
          symbol,
          address: bal.address || '',
          network: bal.network || 'testnet',
          balance,
          ngnValue,
          hasWallet: !!bal.address,
          rate,
        });
      }
    });

    // Convert to array, sort by value (highest first)
    return Array.from(tokenMap.values())
      .sort((a, b) => b.ngnValue - a.ngnValue);
  }, [addresses, balances, getTokenRate]);

  // DERIVED DATA - all memoized
  const walletTokens = useMemo(() => 
    availableTokens.filter(token => token.hasWallet), 
    [availableTokens]
  );

  const tokensWithBalance = useMemo(() => 
    availableTokens.filter(token => token.balance > 0), 
    [availableTokens]
  );

  const totalPortfolioValue = useMemo(() => 
    availableTokens.reduce((sum, token) => sum + token.ngnValue, 0),
    [availableTokens]
  );

  const primaryToken = useMemo(() => 
    availableTokens.length > 0 ? availableTokens[0] : null,
    [availableTokens]
  );

 

  // DEBUG: Test normalization
  const testNormalization = (input: string) => {
    const normalized = normalizeChain(input);
    return normalized;
  };

  // Get token by chain - WITH DEBUG
  const getTokenByChain = useCallback((chain: string): TokenInfo | null => {
    const key = normalizeChain(chain);
    
    const found = availableTokens.find(token => token.chain === key) || null;
    return found;
  }, [availableTokens]);

  // Get token by symbol - WITH DEBUG  
  const getTokenBySymbol = useCallback((symbol: string): TokenInfo | null => {
    const normalizedSymbol = symbol.toUpperCase();
    
    const found = availableTokens.find(token => 
      token.symbol.toUpperCase() === normalizedSymbol
    ) || null;
    return found;
  }, [availableTokens]);

  // Combined getTokenInfo - WITH DEBUG
  const getTokenInfo = useCallback((chainOrSymbol: string): TokenInfo | null => {
    const chainKey = normalizeChain(chainOrSymbol);
    const byChain = getTokenByChain(chainKey);
    if (byChain) {
      return byChain;
    }
    
    // Try by symbol
    const bySymbol = getTokenBySymbol(chainOrSymbol);
    if (bySymbol) {
      return bySymbol;
    }
    return null;
  }, [getTokenByChain, getTokenBySymbol]);

  // Add test function
  const testLookup = useCallback((input: string) => {
    const result = getTokenInfo(input);
    return result;
  }, [getTokenInfo]);

  // CORE FUNCTIONS (using the memoized lookups)
  const getWalletBalance = useCallback((chain: string): number => 
    getTokenByChain(chain)?.balance || 0,
    [getTokenByChain]
  );

  const getWalletAddress = useCallback((chain: string): string => 
    getTokenByChain(chain)?.address || '',
    [getTokenByChain]
  );

  const getWalletNetwork = useCallback((chain: string): string => 
    getTokenByChain(chain)?.network || 'testnet',
    [getTokenByChain]
  );

  const hasWalletForToken = useCallback((chain: string): boolean => 
    getTokenByChain(chain)?.hasWallet || false,
    [getTokenByChain]
  );

 
  const isTokenSupported = useCallback((chainOrSymbol: string): boolean => {
    const key = normalizeChain(chainOrSymbol);
    return availableTokens.some(token => 
      token.chain === key || 
      token.symbol.toUpperCase() === chainOrSymbol.toUpperCase()
    );
  }, [availableTokens]);

  // FORMATTING HELPERS
  const formatBalance = useCallback((chain: string, maxDecimals = 6): string => {
    const token = getTokenByChain(chain);
    if (!token) return '0';
    return formatTokenAmount(token.balance, chain, { maxDecimals });
  }, [getTokenByChain]);

  const formatValue = useCallback((chain: string, currency: 'NGN' | 'USD' = 'NGN'): string => {
    const token = getTokenByChain(chain);
    if (!token) return currency === 'NGN' ? '₦0' : '$0';
    
    const value = token.ngnValue;
    const formatted = new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    
    return currency === 'NGN' ? `₦${formatted}` : `$${(value / 1500).toFixed(2)}`;
  }, [getTokenByChain]);

  const isLoading = addressesLoading || balancesLoading;
  const error = addressesError || balancesError;
  
  const refetch = useCallback(async () => {
    await Promise.all([refetchAddresses(), refetchBalances()]);
  }, [refetchAddresses, refetchBalances]);

  return {
    availableTokens,
    walletTokens,
    tokensWithBalance,
       testLookup, // Add test function
    debugData: {
      addresses,
      balances,
      availableTokens,
      exchangeRates: rates
    },
    getTokenBySymbol,
    getTokenByChain,
    getTokenInfo,
    isTokenSupported,
    
    getWalletBalance,
    getWalletAddress,
    getWalletNetwork,
    hasWalletForToken,
    
    getTokenSymbol,
    getTokenName,
    getTokenRate: (symbol: string) => getTokenRate(symbol),
    
    totalPortfolioValue,
    primaryToken,
    
    formatBalance,
    formatValue,
    
    isLoading,
    error,
    refetch,
    
    addresses,
    balances,
    addressesCount: addresses.length,
    balancesCount: balances.length,
  };
}