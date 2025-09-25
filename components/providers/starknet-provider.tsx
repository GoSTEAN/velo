// providers/starknet-provider.ts
import { Provider, constants, hash } from "starknet";
import { BlockchainProvider, WalletMonitorResult, Transaction } from "@/types/multi-chain";
import { normalizeStarknetAddress, isValidStarknetAddress } from "@/components/lib/utils";

// Known tokens for Starknet
const STARKNET_KNOWN_TOKENS = new Map([
  ["0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", { symbol: "STRK", decimals: 18 }],
  ["0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", { symbol: "ETH", decimals: 18 }],
]);

export class StarknetProvider implements BlockchainProvider {
  name = "starknet";
  chainId = "starknet-sepolia";
  private provider: Provider;

  constructor(nodeUrl: string) {
    this.provider = new Provider({
      chainId: constants.StarknetChainId.SN_SEPOLIA,
      nodeUrl: nodeUrl,
    });
  }

  async monitorWalletTransactions(
    walletAddress: string, 
    fromBlock?: number
  ): Promise<WalletMonitorResult> {
    const normalizedWallet = normalizeStarknetAddress(walletAddress);
    const transactions: Transaction[] = [];
    
    try {
      const currentBlock = await this.provider.getBlock("latest");
      const currentBlockNumber = currentBlock.block_number;
      const scanFromBlock = fromBlock || Math.max(0, currentBlockNumber - 1000); // Reduced for performance

      console.log(`Scanning Starknet blocks ${scanFromBlock} to ${currentBlockNumber}`);

      // Use event filtering (more efficient than scanning each block)
      const transferEventKey = hash.getSelectorFromName("Transfer");
      
      const events = await this.provider.getEvents({
        from_block: { block_number: scanFromBlock },
        to_block: { block_number: currentBlockNumber },
        keys: [[transferEventKey]],
        chunk_size: 100
      });

      for (const event of events.events) {
        if (event.data && event.data.length >= 3) {
          const toAddress = normalizeStarknetAddress(event.data[1]);
          
          if (toAddress === normalizedWallet) {
            const fromAddress = normalizeStarknetAddress(event.data[0]);
            const amount = BigInt(event.data[2] || "0");
            
            const tokenInfo = STARKNET_KNOWN_TOKENS.get(normalizeStarknetAddress(event.from_address)) || 
                            { symbol: "UNKNOWN", decimals: 18 };

            transactions.push({
              hash: event.transaction_hash,
              block: event.block_number,
              timestamp: Math.floor(Date.now() / 1000), // Starknet events don't have timestamp
              confirmations: currentBlockNumber - event.block_number,
              from: fromAddress,
              to: toAddress,
              amount: amount.toString(),
              tokenAddress: event.from_address,
              tokenSymbol: tokenInfo.symbol,
              tokenDecimals: tokenInfo.decimals,
              type: "ERC20_TRANSFER"
            });
          }
        }
      }

      return {
        status: "success",
        walletAddress: normalizedWallet,
        transactions: transactions.sort((a, b) => b.block - a.block),
        totalTransactions: transactions.length,
        scannedBlocks: { from: scanFromBlock, to: currentBlockNumber }
      };

    } catch (error) {
      console.error("Starknet monitoring error:", error);
      return {
        status: "error",
        walletAddress: normalizedWallet,
        transactions: [],
        totalTransactions: 0,
        scannedBlocks: { from: 0, to: 0 },
        error: "Failed to monitor Starknet wallet",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.provider.getBlock("latest");
      return true;
    } catch {
      return false;
    }
  }

  normalizeAddress(address: string): string {
    return normalizeStarknetAddress(address);
  }

  isValidAddress(address: string): boolean {
    return isValidStarknetAddress(address);
  }
}