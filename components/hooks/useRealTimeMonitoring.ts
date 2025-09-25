// hooks/useRealTimeMonitoring.ts
import { useState, useEffect, useCallback } from 'react';
import { useWalletMonitoring } from './useWalletMonitoring';
import { Transaction } from '@/types/multi-chain';

interface RealTimeMonitoringConfig {
  pollInterval?: number; // milliseconds
  fromBlock?: number;
}

export function useRealTimeMonitoring(
  chain: string, 
  walletAddress: string, 
  config: RealTimeMonitoringConfig = {}
) {
  const { monitorWallet, isMonitoring, getError } = useWalletMonitoring();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastCheckedBlock, setLastCheckedBlock] = useState<number>(0);

  const { pollInterval = 30000, fromBlock } = config;

  const checkForNewTransactions = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const result = await monitorWallet(chain, walletAddress, fromBlock || lastCheckedBlock);
      
      if (result.status === 'success' && result.transactions.length > 0) {
        setTransactions(prev => {
          // Merge and deduplicate transactions
          const newTransactions = [...result.transactions];
          const existingHashes = new Set(prev.map(tx => tx.hash));
          const uniqueNewTransactions = newTransactions.filter(tx => !existingHashes.has(tx.hash));
          
          return [...uniqueNewTransactions, ...prev].sort((a, b) => b.block - a.block);
        });

        // Update last checked block to the highest block scanned
        if (result.scannedBlocks.to > lastCheckedBlock) {
          setLastCheckedBlock(result.scannedBlocks.to);
        }
      }
    } catch (error) {
      console.error(`Error monitoring ${chain} wallet:`, error);
    }
  }, [chain, walletAddress, fromBlock, lastCheckedBlock, monitorWallet]);

  // Initial monitoring
  useEffect(() => {
    checkForNewTransactions();
  }, [checkForNewTransactions]);

  // Set up polling
  useEffect(() => {
    if (!walletAddress) return;

    const intervalId = setInterval(checkForNewTransactions, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [checkForNewTransactions, pollInterval, walletAddress]);

  const latestTransaction = transactions[0];
  const hasNewTransactions = transactions.length > 0;

  return {
    transactions,
    latestTransaction,
    hasNewTransactions,
    isLoading: isMonitoring(chain),
    error: getError(chain),
    lastCheckedBlock,
    refresh: checkForNewTransactions,
  };
}