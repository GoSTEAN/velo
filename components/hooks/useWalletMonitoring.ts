// hooks/useWalletMonitoring.ts
import { useState, useEffect, useCallback } from 'react';
import { BlockchainManager } from '@/service/blockchain-manager';
import { WalletMonitorResult } from '@/types/multi-chain';

const blockchainManager = new BlockchainManager();

export function useWalletMonitoring() {
  const [monitoringResults, setMonitoringResults] = useState<Map<string, WalletMonitorResult>>(new Map());
  const [loading, setLoading] = useState<Map<string, boolean>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const monitorWallet = useCallback(async (chain: string, walletAddress: string, fromBlock?: number) => {
    setLoading(prev => new Map(prev).set(chain, true));
    setErrors(prev => new Map(prev).set(chain, ''));

    try {
      const result = await blockchainManager.monitorWallet(chain, walletAddress, fromBlock);
      setMonitoringResults(prev => new Map(prev).set(chain, result));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors(prev => new Map(prev).set(chain, errorMessage));
      throw error;
    } finally {
      setLoading(prev => new Map(prev).set(chain, false));
    }
  }, []);

  const getWalletTransactions = useCallback((chain: string) => {
    return monitoringResults.get(chain);
  }, [monitoringResults]);

  const isMonitoring = useCallback((chain: string) => {
    return loading.get(chain) || false;
  }, [loading]);

  const getError = useCallback((chain: string) => {
    return errors.get(chain);
  }, [errors]);

  return {
    monitorWallet,
    getWalletTransactions,
    isMonitoring,
    getError,
    monitoringResults: Object.fromEntries(monitoringResults),
  };
}