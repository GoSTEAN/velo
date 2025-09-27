// providers/ethereum-provider.ts
import { ethers } from "ethers";
import { BlockchainProvider, WalletMonitorResult, Transaction } from "@/types/multi-chain";

const KNOWN_ERC20_TOKENS: { [address: string]: { symbol: string; decimals: number } } = {
  // Native ETH (special zero address)
  "0x0000000000000000000000000000000000000000": { symbol: "ETH", decimals: 18 },
  
  // Sepolia testnet tokens (real addresses)
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9": { symbol: "WETH", decimals: 18 },
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": { symbol: "USDC", decimals: 6 },
  "0xE72f3E105e475D7Db3a003FfA377aFAe9d2B7A15": { symbol: "DAI", decimals: 18 },
};


export class EthereumProvider implements BlockchainProvider {
  name = "ethereum";
  chainId: string;
  private provider: ethers.JsonRpcProvider;

  constructor(nodeUrl: string, chainId: string) {
    this.provider = new ethers.JsonRpcProvider(nodeUrl);
    this.chainId = chainId;
  }

  async monitorWalletTransactions(
    walletAddress: string, 
    fromBlock?: number
  ): Promise<WalletMonitorResult> {
    const normalizedAddress = this.normalizeAddress(walletAddress);
    const currentBlock = await this.provider.getBlockNumber();
    const scanFromBlock = fromBlock || Math.max(0, currentBlock - 10000);

    const transactions: Transaction[] = [];

    // Monitor ETH transfers
    const ethTransfers = await this.getEthTransfers(normalizedAddress, scanFromBlock, currentBlock);
    transactions.push(...ethTransfers);

    // Monitor ERC20 transfers
    const erc20Transfers = await this.getERC20Transfers(normalizedAddress, scanFromBlock, currentBlock);
    transactions.push(...erc20Transfers);

    return {
      status: "success",
      walletAddress: normalizedAddress,
      transactions: transactions.sort((a, b) => b.block - a.block),
      totalTransactions: transactions.length,
      scannedBlocks: { from: scanFromBlock, to: currentBlock }
    };
  }

  private async getEthTransfers(
    walletAddress: string, 
    fromBlock: number, 
    toBlock: number
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    
    try {
      // Get ETH transfers by scanning transaction receipts
      const filter = {
        fromBlock: fromBlock,
        toBlock: toBlock,
        to: walletAddress
      };

      console.log(filter)

      // This is a simplified approach - in production, you might want to use a more efficient method
      // like The Graph or specialized indexing services
      const logs = await this.provider.getLogs({
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      console.log(logs)
      // Process blocks in chunks to avoid timeout
      for (let blockNum = fromBlock; blockNum <= toBlock; blockNum += 1000) {
        const endBlock = Math.min(blockNum + 999, toBlock);
        
        const block = await this.provider.getBlock(blockNum, true);
        if (!block || !block.transactions) continue;
      console.log(endBlock)

        for (const txHash of block.transactions) {
          try {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            const tx = await this.provider.getTransaction(txHash);
            
            if (receipt && tx && receipt.to && this.normalizeAddress(receipt.to) === walletAddress) {
              const block = await this.provider.getBlock(receipt.blockNumber);
              
              transactions.push({
                hash: txHash,
                block: receipt.blockNumber,
                timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
                confirmations: toBlock - receipt.blockNumber,
                from: tx.from,
                to: receipt.to,
                amount: ethers.formatEther(tx.value),
                tokenAddress: "0x0000000000000000000000000000000000000000",
                tokenSymbol: "ETH",
                tokenDecimals: 18,
                type: "ETH_TRANSFER"
              });
            }
          } catch (error) {
            console.warn(`Failed to process transaction ${txHash}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching ETH transfers:", error);
    }
    
    return transactions;
  }

  private async getERC20Transfers(
    walletAddress: string, 
    fromBlock: number, 
    toBlock: number
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    
    try {
      // ERC20 Transfer event signature
      const transferTopic = ethers.id("Transfer(address,address,uint256)");
      
      // Get all Transfer events where the recipient is our wallet
      const logs = await this.provider.getLogs({
        fromBlock: fromBlock,
        toBlock: toBlock,
        topics: [
          transferTopic,
          null, // from
          ethers.zeroPadValue(walletAddress, 32) // to
        ]
      });

      for (const log of logs) {
        try {
          const block = await this.provider.getBlock(log.blockNumber);
          const tx = await this.provider.getTransaction(log.transactionHash);
          console.log(tx)
          // Parse transfer parameters from event data
          const from = ethers.getAddress(ethers.dataSlice(log.topics[1], 12));
          const to = ethers.getAddress(ethers.dataSlice(log.topics[2], 12));
          const amount = ethers.getBigInt(log.data);
          
          const tokenInfo = await this.getTokenInfo(log.address);
          
          transactions.push({
            hash: log.transactionHash,
            block: log.blockNumber,
            timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
            confirmations: toBlock - log.blockNumber,
            from,
            to,
            amount: amount.toString(),
            tokenAddress: log.address,
            tokenSymbol: tokenInfo?.symbol,
            tokenDecimals: tokenInfo?.decimals,
            type: "ERC20_TRANSFER"
          });
        } catch (error) {
          console.warn(`Failed to process ERC20 transfer in tx ${log.transactionHash}:`, error);
        }
      }
    } catch (error) {
      console.error("Error fetching ERC20 transfers:", error);
    }
    
    return transactions;
  }

  private async getTokenInfo(tokenAddress: string): Promise<{ symbol: string; decimals: number } | null> {
    const normalizedAddr = this.normalizeAddress(tokenAddress);
    
    // Check known tokens first
    if (KNOWN_ERC20_TOKENS[normalizedAddr]) {
      return KNOWN_ERC20_TOKENS[normalizedAddr];
    }

    try {
      // Create minimal ERC20 interface
      const erc20Interface = new ethers.Interface([
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)"
      ]);
      
      const contract = new ethers.Contract(tokenAddress, erc20Interface, this.provider);
      
      const [symbol, decimals] = await Promise.all([
        contract.symbol().catch(() => "UNKNOWN"),
        contract.decimals().catch(() => 18)
      ]);
      
      return { symbol, decimals };
    } catch (error) {
      console.warn(`Could not fetch token info for ${tokenAddress}:`, error);
      return { symbol: "UNKNOWN", decimals: 18 };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.provider.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }

  normalizeAddress(address: string): string {
    return ethers.getAddress(address);
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
}