import { useCallback, useMemo } from "react";
import { useWalletData } from "./useWalletData"; 

export function useTokenBalance() {
  const {
    addresses,
    balances,
    breakdown,
   
  } = useWalletData();

  const getTokenSymbol = useCallback((chain: string): string => {
    const key = chain ? chain.toLowerCase() : chain;
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
    return symbolMap[key] || (chain ? chain.toUpperCase() : "");
  }, []);

  // Normalize a provided chain or symbol into a canonical chain key used in the app
  const normalizeChain = useCallback((raw: string | undefined | null) => {
    if (!raw) return "";
    const k = String(raw).toLowerCase().trim();
    if (k === "sol" || k === "solana" || k.startsWith("sol")) return "solana";
    if (k === "eth" || k === "ethereum") return "ethereum";
    if (k === "btc" || k === "bitcoin") return "bitcoin";
    if (k === "strk" || k === "starknet") return "starknet";
    if (k === "usdt" || k === "usdt_erc20" || k === "usdt-erc20") return "usdt_erc20";
    if (k === "usdt_trc20" || k === "usdt-trc20" || k === "usdttrc20") return "usdt_trc20";
    if (k === "dot" || k === "polkadot") return "polkadot";
    if (k === "xlm" || k === "stellar") return "stellar";
    return k;
  }, []);

  const getTokenName = useCallback((chain: string): string => {
    const key = chain ? chain.toLowerCase() : chain;
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
    return nameMap[key] || (chain ? chain.charAt(0).toUpperCase() + chain.slice(1) : "");
  }, []);

  // CHANGED: Get balance from balances array instead of breakdown
  const getWalletBalance = useCallback(
    (chain: string): number => {
      if (!balances || !Array.isArray(balances) || balances.length === 0) return 0;
      const key = normalizeChain(chain);
      const balanceInfo = balances.find(
        (b) => normalizeChain(b.chain) === key || normalizeChain(b.symbol) === key
      );
      return parseFloat(balanceInfo?.balance || "0");
    },
    [balances, normalizeChain]
  );

  const getWalletAddress = useCallback(
    (chain: string): string => {
      if (!addresses || !Array.isArray(addresses)) return "";
      const key = normalizeChain(chain);
      const addressInfo = addresses.find((addr) => normalizeChain(addr.chain) === key);
      return addressInfo?.address || "";
    },
    [addresses, normalizeChain]
  );

  const getWalletNetwork = useCallback(
    (chain: string): string => {
      if (!addresses || !Array.isArray(addresses)) return "mainnet";
      const key = normalizeChain(chain);
      const addressInfo = addresses.find((addr) => normalizeChain(addr.chain) === key);
      return addressInfo?.network || "mainnet";
    },
    [addresses, normalizeChain]
  );

  const hasWalletForToken = useCallback(
    (chain: string): boolean => {
      return !!getWalletAddress(chain);
    },
    [getWalletAddress]
  );

  // FIXED: Build availableTokens from both addresses and balances so chains
  // that exist only in balances (e.g., Solana) are included in the dropdown.
  const availableTokens = useMemo(() => {
    // Also ensure balances and breakdown are arrays
    const safeBalances = Array.isArray(balances) ? balances : [];
    const safeBreakdown = Array.isArray(breakdown) ? breakdown : [];

    // tokenMap keyed by lowercase chain
    const tokenMap: Record<string, any> = {};

    if (Array.isArray(addresses)) {
      for (const addr of addresses) {
        const chainKey = normalizeChain(addr.chain);
        if (!chainKey || chainKey === "" || chainKey === "unknown") continue;
        tokenMap[chainKey] = tokenMap[chainKey] || {};
        tokenMap[chainKey].chain = chainKey;
        tokenMap[chainKey].address = addr.address;
        tokenMap[chainKey].network = addr.network;
        tokenMap[chainKey].hasWallet = true;
      }
    }

    for (const b of safeBalances) {
      // Some backends return a non-standard chain or leave chain empty and only provide symbol.
      // Prefer a normalized chain derived from b.chain, but fall back to the symbol when needed.
      let chainKey = normalizeChain(b.chain);
      if (!chainKey || chainKey === "" || chainKey === "unknown") {
        const sym = (b.symbol || "").toLowerCase().trim();
        if (sym === "eth" || sym === "ethereum") chainKey = "ethereum";
        else if (sym === "btc" || sym === "bitcoin") chainKey = "bitcoin";
        else if (sym === "sol" || sym === "solana") chainKey = "solana";
        else if (sym === "strk" || sym === "starknet") chainKey = "starknet";
        else if (sym === "usdt") chainKey = "usdt_erc20";
      }
      if (!chainKey || chainKey === "" || chainKey === "unknown") {
        // Skip entries we can't normalize to a known chain
        continue;
      }

      tokenMap[chainKey] = tokenMap[chainKey] || {};
      tokenMap[chainKey].chain = chainKey;
      tokenMap[chainKey].balance = parseFloat(b.balance || "0") || 0;
      tokenMap[chainKey].symbol = tokenMap[chainKey].symbol || (b.symbol || getTokenSymbol(chainKey));
    }

    // Attach breakdown ngn values if available
    for (const br of safeBreakdown) {
      const chainKey = normalizeChain(br.chain);
      tokenMap[chainKey] = tokenMap[chainKey] || {};
      tokenMap[chainKey].ngnValue = br.ngnValue || 0;
    }

    // Convert map to array and fill in derived fields
    const tokens = Object.keys(tokenMap)
      .filter((k) => k && k !== "unknown")
      .map((chainKey) => {
      const entry = tokenMap[chainKey];
      return {
        chain: chainKey,
        name: getTokenName(chainKey),
        symbol: entry.symbol || getTokenSymbol(chainKey),
        address: entry.address || "",
        network: entry.network || "mainnet",
        balance: typeof entry.balance === "number" ? entry.balance : 0,
        ngnValue: entry.ngnValue || 0,
        hasWallet: !!entry.address,
      };
      })
      .sort((a, b) => a.chain.localeCompare(b.chain));

    // Ensure core chains (ethereum, bitcoin, solana) are present when balances contain only symbols
    const ensureFromBalances = (symList: Array<{ chain: string; sym: string }>) => {
      for (const { chain, sym } of symList) {
        const exists = tokens.find((t) => t.chain === chain);
        if (!exists) {
          const match = safeBalances.find((b) => ((b.symbol || "") + "").toLowerCase() === sym.toLowerCase());
          if (match) {
            tokens.push({
              chain,
              name: getTokenName(chain),
              symbol: match.symbol || getTokenSymbol(chain),
              address: match.address || "",
              network: match.network || "mainnet",
              balance: parseFloat(match.balance || "0") || 0,
              ngnValue: 0,
              hasWallet: !!match.address,
            });
          }
        }
      }
    };

    ensureFromBalances([
      { chain: "ethereum", sym: "eth" },
      { chain: "bitcoin", sym: "btc" },
      { chain: "solana", sym: "sol" },
    ]);

    if (typeof window !== "undefined") {
      // debug: help devs see why tokens may be missing
      console.debug("useTokenBalance: availableTokens", tokens);
    }

    return tokens;
  }, [addresses, balances, breakdown, getTokenName, getTokenSymbol, normalizeChain]);


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