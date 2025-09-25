// providers/solana-provider-simple.ts
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BlockchainProvider, WalletMonitorResult, Transaction } from "@/types/multi-chain";

export class SolanaProvider implements BlockchainProvider {
  name = "solana";
  chainId = "solana-mainnet";
  private connection: Connection;

  constructor(nodeUrl: string) {
    this.connection = new Connection(nodeUrl);
  }

  async monitorWalletTransactions(
    walletAddress: string, 
 
  ): Promise<WalletMonitorResult> {
    const publicKey = new PublicKey(walletAddress);
    const transactions: Transaction[] = [];

    try {
      // Get confirmed signatures (more reliable than getSignaturesForAddress)
      const signatures = await this.connection.getConfirmedSignaturesForAddress2(
        publicKey, 
        { limit: 50 }
      );

      for (const signatureInfo of signatures) {
        try {
          // Use getParsedTransaction which handles versioned transactions better
          const transaction = await this.connection.getParsedTransaction(
            signatureInfo.signature,
            { maxSupportedTransactionVersion: 0 }
          );

          if (transaction && transaction.meta) {
            const solTransfers = await this.parseTransactionTransfers(transaction, publicKey);
            transactions.push(...solTransfers);
          }
        } catch (error) {
          console.warn(`Failed to process Solana transaction ${signatureInfo.signature}:`, error);
        }
      }
    } catch (error) {
      console.error("Error monitoring Solana wallet:", error);
      return {
        status: "error",
        walletAddress,
        transactions: [],
        totalTransactions: 0,
        scannedBlocks: { from: 0, to: 0 },
        error: "Failed to monitor Solana wallet",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }

    return {
      status: "success",
      walletAddress: walletAddress,
      transactions: transactions.sort((a, b) => b.block - a.block),
      totalTransactions: transactions.length,
      scannedBlocks: { from: 0, to: 0 }
    };
  }

  private async parseTransactionTransfers(
    transaction: any, // Using any to avoid type complexity
    walletAddress: PublicKey
  ): Promise<Transaction[]> {
    const transfers: Transaction[] = [];
    
    if (!transaction.meta) return transfers;

    try {
      // Simple balance change detection
      const preBalances = transaction.meta.preBalances;
      const postBalances = transaction.meta.postBalances;
      
      const accountKeys = transaction.transaction.message.accountKeys.map(
        (acc: any) => new PublicKey(acc.pubkey)
      );

      for (let i = 0; i < accountKeys.length; i++) {
        const account = accountKeys[i];
        
        if (account.equals(walletAddress)) {
          const balanceChange = postBalances[i] - preBalances[i];
          
          if (balanceChange > 0) {
            transfers.push({
              hash: transaction.transaction.signatures[0],
              block: transaction.slot,
              timestamp: transaction.blockTime || Math.floor(Date.now() / 1000),
              confirmations: 0,
              from: "unknown", // Simplified - you'd need complex analysis to find the sender
              to: walletAddress.toBase58(),
              amount: (balanceChange / LAMPORTS_PER_SOL).toString(),
              tokenAddress: "SOL",
              tokenSymbol: "SOL",
              tokenDecimals: 9,
              type: "SOL_TRANSFER"
            });
          }
        }
      }
    } catch (error) {
      console.warn("Failed to parse transaction transfers:", error);
    }

    return transfers;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connection.getEpochInfo();
      return true;
    } catch {
      return false;
    }
  }

  normalizeAddress(address: string): string {
    try {
      return new PublicKey(address).toBase58();
    } catch {
      return address;
    }
  }

  isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}