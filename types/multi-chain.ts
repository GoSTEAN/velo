// types/multi-chain.ts
export interface Transaction {
  hash: string;
  block: number;
  timestamp: number;
  confirmations: number;
  from: string;
  to: string;
  amount: string;
  tokenAddress: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  type: "ERC20_TRANSFER" | "ETH_TRANSFER" | "SOL_TRANSFER" | "SPL_TRANSFER" | "CONTRACT_CALL";
}

export interface WalletMonitorResult {
  status: "success" | "error";
  walletAddress: string;
  transactions: Transaction[];
  totalTransactions: number;
  scannedBlocks: {
    from: number;
    to: number;
  };
  error?: string;
  details?: string;
}

export interface BlockchainProvider {
  name: string;
  chainId: string;
  monitorWalletTransactions(
    walletAddress: string, 
    fromBlock?: number
  ): Promise<WalletMonitorResult>;
  testConnection(): Promise<boolean>;
  normalizeAddress(address: string): string;
  isValidAddress(address: string): boolean;
}

export interface MultiChainConfig {
  defaultChain: string;
  providers: {
    [chain: string]: BlockchainProvider;
  };
}