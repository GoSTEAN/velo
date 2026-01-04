
import { useApiQuery } from './useApiQuery';
import { getStats } from '@/lib/api';
import { StatsData } from '@/types/admin';

export const useStats = () => {
    return useApiQuery<StatsData>(
        getStats,
        {
            cacheKey: 'platform-stats',
            ttl: 5 * 60 * 1000, // 5 minutes
            backgroundRefresh: true,
            requireAuth: false // Stats might be public? The api.ts getStats uses token if available but let's check.
            // usage in api.ts: const token = tokenManager.getToken(); ... Authorization: Bearer ${token}
            // logic suggests it works with or without, or throws if 401. 
            // app/stats/page.tsx uses it, likely needs auth if it's user specific, but the cache key suggests global stats?
            // Checking api.ts content again: uses token. 
            // If it's public stats, maybe we shouldn't require auth in useApiQuery.
            // But getStats calls tokenManager.getToken().
        }
    );
};
