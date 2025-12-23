import { useAuthQuery } from './useAuthQuery';
import { apiClient } from '@/lib/api-client';
import { useCommonOperations } from './useCommonOperations';

export const useMerchantPayments = () => {
  const { requireAuth } = useCommonOperations();

  const { data: historyData, ...historyRest } = useAuthQuery(
    () => apiClient.getMerchantPaymentHistory(),
    { cacheKey: 'merchant-payment-history' }
  );

  const { data: statsData, ...statsRest } = useAuthQuery(
    () => apiClient.getMerchantPaymentStats(),
    { cacheKey: 'merchant-payment-stats' }
  );

  const createPayment = async (request: any) => {
    requireAuth();
    return await apiClient.createMerchantPayment(request);
  };

  const getPaymentStatus = async (paymentId: string) => {
    requireAuth();
    return await apiClient.getMerchantPaymentStatus(paymentId);
  };

  const payInvoice = async (paymentId: string, fromAddress: string) => {
    requireAuth();
    return await apiClient.payMerchantInvoice(paymentId, fromAddress);
  };

  const refetchAll = async () => {
    await Promise.all([historyRest.refetch(), statsRest.refetch()]);
  };

  return {
    paymentHistory: historyData?.payments || [],
    stats: statsData?.stats || null,
    isLoading: historyRest.isLoading || statsRest.isLoading,
    error: historyRest.error || statsRest.error,
    createPayment,
    getPaymentStatus,
    payInvoice,
    fetchPaymentHistory: historyRest.refetch,
    fetchStats: statsRest.refetch,
    refetchAll,
  };
};