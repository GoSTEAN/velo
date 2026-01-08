import { useAuthQuery } from './useAuthQuery';
import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  totalTransactions: number;
  activeSplits: number;
  qrPayments: number;
}

export const useDashboardStats = () => {
  // Get transaction history for transaction count
  const { data: transactionHistory } = useAuthQuery(
    () => apiClient.getTransactionHistory({ page: 1, limit: 100 }),
    {
      cacheKey: 'transaction-history-dashboard',
      ttl: 5 * 60 * 1000, // 5 minutes
      backgroundRefresh: true
    }
  );

  // Get split payment templates for active splits count
  const { data: splitTemplates } = useAuthQuery(
    () => apiClient.getSplitPaymentTemplates(),
    {
      cacheKey: 'split-templates-dashboard',
      ttl: 5 * 60 * 1000, // 5 minutes
      backgroundRefresh: true
    }
  );

  // Get merchant payment history for QR payments count
  const { data: merchantHistory } = useAuthQuery(
    () => apiClient.getMerchantPaymentHistory({ page: 1, limit: 100 }),
    {
      cacheKey: 'merchant-history-dashboard',
      ttl: 5 * 60 * 1000, // 5 minutes
      backgroundRefresh: true
    }
  );

  const totalTransactions = transactionHistory?.transactions?.length || 0;
  const activeSplits = splitTemplates?.templates?.filter((t: any) => t.isActive !== false)?.length || 0; // Default to active if no isActive field
  const qrPayments = merchantHistory?.payments?.length || 0;

  return {
    totalTransactions,
    activeSplits,
    qrPayments,
    isLoading: !transactionHistory || !splitTemplates || !merchantHistory
  };
};