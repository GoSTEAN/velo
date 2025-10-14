// components/hooks/useTokenBalance.ts
import { useCallback, useMemo } from "react";
import { useWalletAddresses } from "./useAddresses";
import { useTotalBalance } from "./useTotalBalance";

export function useTokenBalance() {
  const { addresses, loading: addressesLoading } = useWalletAddresses();
  const { breakdown, loading: balanceLoading } = useTotalBalance();

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

  const getWalletBalance = useCallback((chain: string): number => {
    if (!breakdown || breakdown.length === 0) return 0;
    const balanceInfo = breakdown.find((b) => b.chain === chain);
    return balanceInfo?.balance || 0;
  }, [breakdown]);

  const getWalletAddress = useCallback((chain: string): string => {
    if (!addresses) return "";
    const addressInfo = addresses.find((addr) => addr.chain === chain);
    return addressInfo?.address || "";
  }, [addresses]);

  const getWalletNetwork = useCallback((chain: string): string => {
    if (!addresses) return "testnet";
    const addressInfo = addresses.find((addr) => addr.chain === chain);
    return addressInfo?.network || "testnet";
  }, [addresses]);

  const hasWalletForToken = useCallback((chain: string): boolean => {
    return !!getWalletAddress(chain);
  }, [getWalletAddress]);

  // Get all available tokens with their data
  const availableTokens = useMemo(() => {
    if (!addresses) return [];
    
    return addresses.map(addr => ({
      chain: addr.chain,
      name: getTokenName(addr.chain),
      symbol: getTokenSymbol(addr.chain),
      address: addr.address,
      network: addr.network,
      balance: getWalletBalance(addr.chain),
      hasWallet: true,
    }));
  }, [addresses, getTokenName, getTokenSymbol, getWalletBalance]);

  const isLoading = addressesLoading ;

  return {
    // Utility functions
    getTokenSymbol,
    getTokenName,
    getWalletBalance,
    getWalletAddress,
    getWalletNetwork,
    hasWalletForToken,
    
    // Data
    addresses,
    breakdown,
    availableTokens,
    isLoading,
  };
}   