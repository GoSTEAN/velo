'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '../admin/components/statsCard';
import { ChainStats } from '../admin/components/chain-stats';
import { UsageStats } from '@/app/admin/components/usage-stats';
import { StatsData } from '@/types/admin';
import { getStats } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { RefreshCw } from 'lucide-react';

// Cache key for localStorage
const STATS_CACHE_KEY = 'admin_dashboard_stats';
const CACHE_DURATION = 5 * 60 * 1000; 

interface CachedStats {
  data: StatsData;
  timestamp: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get cached data
  const getCachedStats = (): CachedStats | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(STATS_CACHE_KEY);
      if (!cached) return null;
      
      const parsed: CachedStats = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
      
      return isExpired ? null : parsed;
    } catch {
      return null;
    }
  };

  // Save data to cache
  const setCachedStats = (data: StatsData) => {
    if (typeof window === 'undefined') return;
    
    const cachedData: CachedStats = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(cachedData));
  };

  // Clear cache
  const clearCache = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STATS_CACHE_KEY);
  };

  const fetchStats = async (backgroundRefresh = false) => {
    if (!backgroundRefresh) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);

    try {
      // Try to use cached data first (only for initial load)
      if (!backgroundRefresh) {
        const cached = getCachedStats();
        if (cached) {
          setStats(cached.data);
          setLoading(false);
          
          // Background refresh if cache is older than 2 minutes
          const cacheAge = Date.now() - cached.timestamp;
          if (cacheAge > 2 * 60 * 1000) {
            fetchStats(true); 
          }
          return;
        }
      }

      // Fetch fresh data
      const data = await getStats();
      setStats(data);
      setCachedStats(data);
      
    } catch (err) {
      // Only show error if it's not a background refresh
      if (!backgroundRefresh) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } else {
        console.error('Background refresh failed:', err);
      }
    } finally {
      if (!backgroundRefresh) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    clearCache(); 
    await fetchStats(false);
  };

  useEffect(() => {
    fetchStats(false);
    
    // Set up periodic background refresh every 5 minutes
    const interval = setInterval(() => {
      fetchStats(true);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500">Error: {error}</p>
              <Button onClick={handleManualRefresh} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistic Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform statistics and usage
            {isRefreshing && (
              <span className="ml-2 text-sm text-blue-500">
                <RefreshCw className="inline h-3 w-3 animate-spin mr-1" />
                Updating...
              </span>
            )}
          </p>
        </div>
        <Button 
          onClick={handleManualRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="space-y-6">
        <StatsCards data={stats} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <ChainStats data={stats} />
          <UsageStats data={stats} />
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Summary</CardTitle>
            <CardDescription>
              Current overview of platform performance and user activity
              {getCachedStats() && (
                <span className="text-xs text-green-600 ml-2">
                  • Cached data (updates every 5 min)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <h4 className="font-semibold">Transaction Summary</h4>
                <ul className="mt-2 space-y-1">
                  <li>Total transactions across all chains: {stats.perChain.reduce((sum, chain) => sum + chain.count, 0)}</li>
                  <li>Most active chain: {stats.mostUsedChain}</li>
                  <li>Total confirmed amount: {stats.totalConfirmedAmount}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Feature Usage</h4>
                <ul className="mt-2 space-y-1">
                  <li>Most used feature: Splitting ({stats.usage.splitting} times)</li>
                  <li>Send operations: {stats.usage.send}</li>
                  <li>QRPayments: {stats.usage.qrPayment}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}