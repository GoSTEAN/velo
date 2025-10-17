import { useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/context/AuthContext';
import { DepositCheckResponse } from '@/types/authContext';

interface UseDepositsReturn {
  checkDeposits: () => Promise<DepositCheckResponse>;
  checkDeploy: () => Promise<DepositCheckResponse>;
}

export const useDeposits = (): UseDepositsReturn => {
  const { token } = useAuth();

  const checkDeposits = useCallback(async (): Promise<DepositCheckResponse> => {
    if (!token) throw new Error('Authentication required');
    return await apiClient.checkDeposits();
  }, [token]);

  const checkDeploy = useCallback(async (): Promise<DepositCheckResponse> => {
    if (!token) throw new Error('Authentication required');
    return await apiClient.checkDeploy();
  }, [token]);

  return {
    checkDeposits,
    checkDeploy,
  };
};