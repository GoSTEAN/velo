export const normalizeChain = (raw: string | undefined | null): string => {
  if (!raw) return "";
  
  const k = String(raw).toLowerCase().trim();
  
  if (k === "sol" || k === "solana") return "solana";
  if (k === "eth" || k === "ethereum") return "ethereum";
  if (k === "btc" || k === "bitcoin") return "bitcoin";
  if (k === "strk" || k === "starknet") return "starknet";
  if (k === "usdt" || k === "usdt_erc20" || k === "usdt-erc20") return "usdt_erc20";
  if (k === "usdt_trc20" || k === "usdt-trc20") return "usdt_trc20";
  if (k === "dot" || k === "polkadot") return "polkadot";
  if (k === "xlm" || k === "stellar") return "stellar";
  
  // Partial matches (starts with)
  if (k.startsWith("sol")) return "solana";
  if (k.startsWith("eth")) return "ethereum";
  if (k.startsWith("btc")) return "bitcoin";
  if (k.startsWith("strk")) return "starknet";
  if (k.startsWith("usdt")) return "usdt_erc20"; 
  if (k.startsWith("dot")) return "polkadot";
  if (k.startsWith("xlm")) return "stellar";
  
  return k;
};

export const getTokenSymbol = (chain: string): string => {
  if (!chain) return "";
  
  const key = chain.toLowerCase();
  const symbolMap: Record<string, string> = {
    ethereum: "ETH",
    bitcoin: "BTC",
    solana: "SOL",
    starknet: "STRK",
    usdt_erc20: "USDT",
    usdt_trc20: "USDT",
    polkadot: "DOT",
    stellar: "XLM",
    // Add more mappings as needed
    tron: "TRX",
    polygon: "MATIC",
    avalanche: "AVAX",
    arbitrum: "ARB",
    optimism: "OP",
  };
  
  return symbolMap[key] || chain.toUpperCase();
};

export const getTokenName = (chain: string): string => {
  if (!chain) return "";
  
  const key = chain.toLowerCase();
  const nameMap: Record<string, string> = {
    ethereum: "Ethereum",
    bitcoin: "Bitcoin",
    solana: "Solana",
    starknet: "Starknet",
    usdt_erc20: "USDT (ERC20)",
    usdt_trc20: "USDT (TRC20)",
    polkadot: "Polkadot",
    stellar: "Stellar",
    tron: "TRON",
    polygon: "Polygon",
    avalanche: "Avalanche",
    arbitrum: "Arbitrum",
    optimism: "Optimism",
  };
  
  return nameMap[key] || chain.charAt(0).toUpperCase() + chain.slice(1);
};

export const getRateKey = (symbol: string): string => {
  if (!symbol) return "USDT";
  
  const symbolUpper = symbol.toUpperCase();
  const rateKeyMap: Record<string, string> = {
    ETH: "ETH",
    BTC: "BTC",
    SOL: "SOL",
    STRK: "STRK",
    USDT: "USDT",
    USDC: "USDC",
    DAI: "DAI",
    DOT: "DOT",
    XLM: "XLM",
    MATIC: "MATIC",
    AVAX: "AVAX",
    ARB: "ARB",
    OP: "OP",
    TRX: "TRX",
  };
  
  return rateKeyMap[symbolUpper] || "USDT";
};

// Get blockchain explorer URL for a token
export const getExplorerUrl = (
  chain: string, 
  txHash: string, 
  network: "testnet" | "mainnet" = "mainnet"
): string => {
  const explorerUrls: Record<string, Record<"testnet" | "mainnet", string>> = {
    ethereum: {
      testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
      mainnet: `https://etherscan.io/tx/${txHash}`,
    },
    bitcoin: {
      testnet: `https://blockstream.info/testnet/tx/${txHash}`,
      mainnet: `https://blockstream.info/tx/${txHash}`,
    },
    solana: {
      testnet: `https://explorer.solana.com/tx/${txHash}?cluster=devnet`,
      mainnet: `https://explorer.solana.com/tx/${txHash}`,
    },
    starknet: {
      testnet: `https://sepolia.voyager.online/tx/${txHash}`,
      mainnet: `https://voyager.online/tx/${txHash}`,
    },
    polkadot: {
      testnet: `https://polkascan.io/testnet/polkadot/transaction/${txHash}`,
      mainnet: `https://polkascan.io/polkadot/transaction/${txHash}`,
    },
    stellar: {
      testnet: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
      mainnet: `https://stellar.expert/explorer/public/tx/${txHash}`,
    },
  };
  
  const normalizedChain = normalizeChain(chain);
  const explorer = explorerUrls[normalizedChain];
  
  if (!explorer) {
    // Fallback to generic or chain-specific default
    return `https://explorer.example.com/tx/${txHash}`;
  }
  
  return explorer[network];
};

// Check if chain supports smart contracts
export const supportsSmartContracts = (chain: string): boolean => {
  const normalizedChain = normalizeChain(chain);
  const contractChains = new Set([
    "ethereum",
    "starknet",
    "solana",
    "polygon",
    "avalanche",
    "arbitrum",
    "optimism",
    "tron",
  ]);
  
  return contractChains.has(normalizedChain);
};

// Get decimal places for a token
export const getTokenDecimals = (chain: string): number => {
  const normalizedChain = normalizeChain(chain);
  
  const decimalsMap: Record<string, number> = {
    ethereum: 18,
    bitcoin: 8,
    solana: 9,
    starknet: 18,
    polkadot: 10,
    stellar: 7,
    tron: 6,
    usdt_erc20: 6,
    usdt_trc20: 6,
  };
  
  return decimalsMap[normalizedChain] || 18;
};

// Format token amount with proper decimals
export const formatTokenAmount = (
  amount: number | string, 
  chain: string, 
  options?: {
    maxDecimals?: number;
    showSymbol?: boolean;
  }
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const decimals = getTokenDecimals(chain);
  const maxDecimals = options?.maxDecimals || Math.min(decimals, 8);
  
  let formatted: string;
  
  if (numAmount === 0) {
    formatted = "0";
  } else if (numAmount < Math.pow(10, -maxDecimals)) {
    formatted = `<0.${'0'.repeat(maxDecimals - 1)}1`;
  } else {
    formatted = numAmount.toFixed(maxDecimals).replace(/\.?0+$/, '');
  }
  
  if (options?.showSymbol) {
    const symbol = getTokenSymbol(chain);
    return `${formatted} ${symbol}`;
  }
  
  return formatted;
};

// Convert between chain representations
export const chainToSymbol = (chain: string): string => getTokenSymbol(chain);
export const symbolToChain = (symbol: string): string => {
  const symbolUpper = symbol.toUpperCase();
  const reverseMap: Record<string, string> = {
    ETH: "ethereum",
    BTC: "bitcoin",
    SOL: "solana",
    STRK: "starknet",
    USDT: "usdt_erc20", 
    DOT: "polkadot",
    XLM: "stellar",
    TRX: "tron",
    MATIC: "polygon",
    AVAX: "avalanche",
    ARB: "arbitrum",
    OP: "optimism",
  };
  
  return reverseMap[symbolUpper] || symbol.toLowerCase();
};



export const getTokenRateKey = (token: string): string => {
  const rateMap: Record<string, string> = {
    ETHEREUM: "ETH",
    BITCOIN: "BTC",
    SOLANA: "SOL",
    STARKNET: "STRK",
    USDT_TRC20: "USDT",
    USDT_ERC20: "USDT",
    POLKADOT: "DOT",
    STELLAR: "XLM",
  };
  return rateMap[token] || "USDT";
};

export const getTokenChain = (token: string): string => {
  const chainMap: Record<string, string> ={
    ETHEREUM: "ethereum",
    BITCOIN: "bitcoin",
    SOLANA: "solana",
    STARKNET: "starknet",
    USDT_ERC20: "usdt_erc20",
    USDT_TRC20: "usdt_trc20",
    POLKADOT: "polkadot",
    STELLAR: "stellar",
  };
  return chainMap[token] || "ethereum";
};

export const formatBalance = (balance: number): string => {
  if (balance === 0) return "0.00";
  if (balance < 0.001) return "<0.001";
  return balance.toFixed(4);
};

export const formatNGN = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
