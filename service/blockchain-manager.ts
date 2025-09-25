// services/blockchain-manager.ts
import { BlockchainProvider, WalletMonitorResult } from "@/types/multi-chain";
import { StarknetProvider } from "@/components/providers/starknet-provider";
import { EthereumProvider } from "@/components/providers/ethereum-provider";
import { SolanaProvider } from "@/components/providers/solana-provider";

export class BlockchainManager {
  private providers: Map<string, BlockchainProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Starknet
    if (process.env.STARKNET_NODE_URL) {
      const starknetProvider = new StarknetProvider(process.env.STARKNET_NODE_URL);
      this.providers.set("starknet", starknetProvider);
    }

    // Ethereum
    if (process.env.ETHEREUM_NODE_URL) {
      const ethereumProvider = new EthereumProvider(
        process.env.ETHEREUM_NODE_URL,
        process.env.ETHEREUM_CHAIN_ID || "sepolia"
      );
      this.providers.set("ethereum", ethereumProvider);
    }

    // Polygon (EVM-compatible)
    if (process.env.POLYGON_NODE_URL) {
      const polygonProvider = new EthereumProvider(
        process.env.POLYGON_NODE_URL,
        process.env.POLYGON_CHAIN_ID || "polygon-mumbai"
      );
      this.providers.set("polygon", polygonProvider);
    }

    // Solana
  if (process.env.SOLANA_NODE_URL) {
  const solanaProvider = new SolanaProvider(process.env.SOLANA_NODE_URL);
  this.providers.set("solana", solanaProvider);
}
  }

  async monitorWallet(
    chain: string, 
    walletAddress: string, 
    fromBlock?: number
  ): Promise<WalletMonitorResult> {
    const provider = this.providers.get(chain);
    
    if (!provider) {
      return {
        status: "error",
        walletAddress,
        transactions: [],
        totalTransactions: 0,
        scannedBlocks: { from: 0, to: 0 },
        error: `Unsupported blockchain: ${chain}. Supported: ${Array.from(this.providers.keys()).join(", ")}`
      };
    }

    if (!provider.isValidAddress(walletAddress)) {
      return {
        status: "error",
        walletAddress,
        transactions: [],
        totalTransactions: 0,
        scannedBlocks: { from: 0, to: 0 },
        error: `Invalid address format for ${chain}`
      };
    }

    return await provider.monitorWalletTransactions(walletAddress, fromBlock);
  }

  getSupportedChains(): string[] {
    return Array.from(this.providers.keys());
  }

  async testAllConnections(): Promise<{ [chain: string]: boolean }> {
    const results: { [chain: string]: boolean } = {};
    
    for (const [chain, provider] of this.providers) {
      try {
        results[chain] = await provider.testConnection();
      } catch {
        results[chain] = false;
      }
    }
    
    return results;
  }
}