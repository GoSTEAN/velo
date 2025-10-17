import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/context/AuthContext';
import { SplitPaymentTemplate, TemplatesResponse, ExecutionHistoryResponse } from '@/types/authContext';

interface UseSplitPaymentsReturn {
  templates: SplitPaymentTemplate[];
  isLoading: boolean;
  error: string | null;
  refetch: (status?: string) => Promise<void>;
  createSplitPayment: (data: any) => Promise<any>;
  executeSplitPayment: (id: string) => Promise<any>;
  toggleSplitPayment: (id: string) => Promise<any>;
  getExecutionHistory: (id: string, page?: number, limit?: number) => Promise<ExecutionHistoryResponse>;
}

export const useSplitPayments = (): UseSplitPaymentsReturn => {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<SplitPaymentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (status?: string) => {
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getSplitPaymentTemplates(status ? { status } : undefined);
      setTemplates(
        (response.templates || []).map((template: any) => ({
          fromAddress: template.fromAddress ?? '',
          recipients: template.recipients ?? [],
          ...template,
        }))
      );
    } catch (err) {
      console.error('Error fetching split payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch split payments');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createSplitPayment = useCallback(async (data: any) => {
    if (!token) throw new Error('Authentication required');
    return await apiClient.createSplitPayment(data);
  }, [token]);

  const executeSplitPayment = useCallback(async (id: string) => {
    if (!token) throw new Error('Authentication required');
    const result = await apiClient.executeSplitPayment(id);
    // Refresh templates after execution
    await fetchTemplates();
    return result;
  }, [token, fetchTemplates]);

  const toggleSplitPayment = useCallback(async (id: string) => {
    if (!token) throw new Error('Authentication required');
    const result = await apiClient.toggleSplitPaymentStatus(id);
    // Refresh templates after toggle
    await fetchTemplates();
    return result;
  }, [token, fetchTemplates]);

  const getExecutionHistory = useCallback(async (id: string, page?: number, limit?: number) => {
    if (!token) throw new Error('Authentication required');
    return await apiClient.getExecutionHistory(id, { page, limit });
  }, [token]);

  // Initial fetch
  useState(() => {
    if (token) {
      fetchTemplates();
    }
  });

  return {
    templates,
    isLoading,
    error,
    refetch: fetchTemplates,
    createSplitPayment,
    executeSplitPayment,
    toggleSplitPayment,
    getExecutionHistory,
  };
};