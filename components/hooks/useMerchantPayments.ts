import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/context/AuthContext';
import { 
  CreateMerchantPaymentRequest, 
  CreateMerchantPaymentResponse,
  GetMerchantPaymentStatusResponse,
  GetMerchantPaymentHistoryResponse,
  PayMerchantInvoiceResponse
} from '@/types/authContext';

interface MerchantPaymentStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalAmount: string;
}

interface UseMerchantPaymentsReturn {
  // Data
  paymentHistory: GetMerchantPaymentHistoryResponse['payments'];
  stats: MerchantPaymentStats | null;
  
  // State
  isLoading: boolean; // Only true on very first load with no cache
  error: string | null;
  
  // Actions
  createPayment: (request: CreateMerchantPaymentRequest) => Promise<CreateMerchantPaymentResponse>;
  getPaymentStatus: (paymentId: string) => Promise<GetMerchantPaymentStatusResponse>;
  payInvoice: (paymentId: string, fromAddress: string) => Promise<PayMerchantInvoiceResponse>;
  fetchPaymentHistory: (params?: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

export const useMerchantPayments = (): UseMerchantPaymentsReturn => {
  const { token } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<MerchantPaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Silent background fetch for payment history
  const silentFetchPaymentHistory = useCallback(async (params?: any) => {
    if (!token) return;

    try {
      const response = await apiClient.getMerchantPaymentHistory(params);
      setPaymentHistory(response.payments || []);
    } catch (err) {
      console.error('Silent background payment history fetch failed:', err);
      // Don't set error for background failures
    }
  }, [token]);

  // Silent background fetch for stats
  const silentFetchStats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await apiClient.getMerchantPaymentStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Silent background stats fetch failed:', err);
      // Don't set error for background failures
    }
  }, [token]);

  // Initial fetch with cache check for payment history
  const initialFetchPaymentHistory = useCallback(async (params?: any) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      // Check if we have cached payment history
      const cachedHistory = apiClient.getCachedData<any[]>('merchant-payment-history');
      
      // If we have cached data, show it immediately
      if (cachedHistory) {
        setPaymentHistory(cachedHistory);
        
        // Still fetch fresh data in background
        silentFetchPaymentHistory(params);
        return;
      }

      // No cache - fetch fresh data
      const response = await apiClient.getMerchantPaymentHistory(params);
      setPaymentHistory(response.payments || []);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment history');
    }
  }, [token, silentFetchPaymentHistory]);

  // Initial fetch with cache check for stats
  const initialFetchStats = useCallback(async () => {
    if (!token) return;

    try {
      // Check if we have cached stats
      const cachedStats = apiClient.getCachedData<MerchantPaymentStats>('merchant-payment-stats');
      
      // If we have cached data, show it immediately
      if (cachedStats) {
        setStats(cachedStats);
        
        // Still fetch fresh data in background
        silentFetchStats();
        return;
      }

      // No cache - fetch fresh data
      const response = await apiClient.getMerchantPaymentStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Error fetching merchant stats:', err);
      // Don't set initial error for stats - it's less critical
    }
  }, [token, silentFetchStats]);

  // Manual fetch for payment history (shows loading if user triggers)
  const fetchPaymentHistory = useCallback(async (params?: any) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      await silentFetchPaymentHistory(params);
    } catch (err) {
      console.error('Manual payment history fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment history');
    } finally {
      setIsLoading(false);
    }
  }, [token, silentFetchPaymentHistory]);

  // Manual fetch for stats
  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      await silentFetchStats();
    } catch (err) {
      console.error('Manual stats fetch failed:', err);
      // Don't set error for manual stats fetch
    }
  }, [token, silentFetchStats]);

  // Action methods (unchanged - these are user-initiated)
  const createPayment = useCallback(async (request: CreateMerchantPaymentRequest) => {
    if (!token) throw new Error('Authentication required');
    return await apiClient.createMerchantPayment(request);
  }, [token]);

  const getPaymentStatus = useCallback(async (paymentId: string) => {
    if (!token) throw new Error('Authentication required');
    return await apiClient.getMerchantPaymentStatus(paymentId);
  }, [token]);

  const payInvoice = useCallback(async (paymentId: string, fromAddress: string) => {
    if (!token) throw new Error('Authentication required');
    return await apiClient.payMerchantInvoice(paymentId, fromAddress);
  }, [token]);

  // Manual refetch all (shows loading if user triggers)
  const refetchAll = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      await Promise.all([
        silentFetchPaymentHistory(),
        silentFetchStats()
      ]);
    } catch (err) {
      console.error('Manual refetch all failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refetch merchant data');
    } finally {
      setIsLoading(false);
    }
  }, [token, silentFetchPaymentHistory, silentFetchStats]);

  // Initial load - check cache first
  useEffect(() => {
    if (token) {
      const initializeData = async () => {
        try {
          setIsLoading(true);
          await Promise.all([
            initialFetchPaymentHistory(),
            initialFetchStats()
          ]);
        } catch (err) {
          console.error('Initial merchant data load failed:', err);
          setError(err instanceof Error ? err.message : 'Failed to load merchant data');
        } finally {
          setIsLoading(false);
          setIsInitialLoad(false);
        }
      };

      initializeData();
    }
  }, [token, initialFetchPaymentHistory, initialFetchStats]);

  // Setup silent background refresh (every 5 minutes - merchant data changes less frequently)
  useEffect(() => {
    if (!token || isInitialLoad) return;

    const interval = setInterval(() => {
      // Only refresh if tab is visible
      if (!document.hidden) {
        silentFetchPaymentHistory();
        silentFetchStats();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, silentFetchPaymentHistory, silentFetchStats, isInitialLoad]);

  // Only show loading on very first load when no cache exists
  const shouldShowLoading = isLoading && isInitialLoad;

  return {
    paymentHistory,
    stats,
    isLoading: shouldShowLoading,
    error,
    createPayment,
    getPaymentStatus,
    payInvoice,
    fetchPaymentHistory,
    fetchStats,
    refetchAll,
  };
};