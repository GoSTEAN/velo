import { useCallback, useMemo } from "react";
import { useWalletData } from "./useWalletData"; 

export function useTokenBalance() {
  const {
    addresses,
    balances,
    breakdown,
   
  } = useWalletData();

  const getTokenSymbol = useCallback((chain: string): string => {
    const symbolMap: { [key: string]: string } = {
      ethereum: "ETH",
      bitcoin: "BTC",
      solana: "SOL",
      starknet: "STRK",
      usdt_erc20: "USDT",
      usdt_trc20: "USDT",
      polkadot: "DOT",
      stellar: "XLM",
    };
    return symbolMap[chain] || chain.toUpperCase();
  }, []);

  const getTokenName = useCallback((chain: string): string => {
    const nameMap: { [key: string]: string } = {
      ethereum: "Ethereum",
      bitcoin: "Bitcoin",
      solana: "Solana",
      starknet: "Starknet",
      usdt_erc20: "USDT ERC20",
      usdt_trc20: "USDT TRC20",
      polkadot: "Polkadot",
      stellar: "Stellar",
    };
    return nameMap[chain] || chain.charAt(0).toUpperCase() + chain.slice(1);
  }, []);

  // CHANGED: Get balance from balances array instead of breakdown
  const getWalletBalance = useCallback(
    (chain: string): number => {
      if (!balances || !Array.isArray(balances) || balances.length === 0) return 0;
      const balanceInfo = balances.find((b) => b.chain === chain);
      return parseFloat(balanceInfo?.balance || "0");
    },
    [balances]
  );

  const getWalletAddress = useCallback(
    (chain: string): string => {
      if (!addresses || !Array.isArray(addresses)) return "";
      const addressInfo = addresses.find((addr) => addr.chain === chain);
      return addressInfo?.address || "";
    },
    [addresses]
  );

  const getWalletNetwork = useCallback(
    (chain: string): string => {
      if (!addresses || !Array.isArray(addresses)) return "mainnet";
      const addressInfo = addresses.find((addr) => addr.chain === chain);
      return addressInfo?.network || "mainnet";
    },
    [addresses]
  );

  const hasWalletForToken = useCallback(
    (chain: string): boolean => {
      return !!getWalletAddress(chain);
    },
    [getWalletAddress]
  );

  // FIXED: Add proper array checking and error handling
  const availableTokens = useMemo(() => {
    // Check if addresses is a valid array
    if (!addresses || !Array.isArray(addresses)) {
      console.warn('Addresses is not a valid array:', addresses);
      return [];
    }

    // Also ensure balances and breakdown are arrays
    const safeBalances = Array.isArray(balances) ? balances : [];
    const safeBreakdown = Array.isArray(breakdown) ? breakdown : [];

    return addresses.map((addr) => {
      const balanceInfo = safeBalances.find((b) => b.chain === addr.chain);
      const breakdownInfo = safeBreakdown.find((b) => b.chain === addr.chain);

      return {
        chain: addr.chain,
        name: getTokenName(addr.chain),
        symbol: getTokenSymbol(addr.chain),
        address: addr.address,
        network: addr.network,
        balance: parseFloat(balanceInfo?.balance || "0"),
        ngnValue: breakdownInfo?.ngnValue || 0,
        hasWallet: true,
      };
    });
  }, [addresses, balances, breakdown, getTokenName, getTokenSymbol]);


  return {
    getTokenSymbol,
    getTokenName,
    getWalletBalance,
    getWalletAddress,
    getWalletNetwork,
    hasWalletForToken,
    addresses: Array.isArray(addresses) ? addresses : [],
    balances: Array.isArray(balances) ? balances : [],
    breakdown: Array.isArray(breakdown) ? breakdown : [],
    availableTokens,
  };
}