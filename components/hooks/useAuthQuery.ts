import { useApiQuery } from './useApiQuery';
import { useAuth } from '@/components/context/AuthContext';

export function useAuthQuery<T>(
  fetchFn: () => Promise<T>,
  options: Omit<Parameters<typeof useApiQuery>[1], 'requireAuth'>
) {
  const { token } = useAuth();
  
  return useApiQuery(async () => {
    if (!token) throw new Error('Authentication required');
    return fetchFn();
  }, {
    ...options,
    requireAuth: true,
  });
}