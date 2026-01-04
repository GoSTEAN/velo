'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '@/app/admin/components/statsCard';
import { ChainStats } from '@/app/admin/components/chain-stats';
import { UsageStats } from '@/app/admin/components/usage-stats';
import { StatsData } from '@/types/admin';
import { getStats } from '@/lib/api';
import { useStats } from '@/components/hooks/useStats';
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

export default function Statistic() {
  const { data: stats, isLoading: loading, error, refetch } = useStats();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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
    <div className="container mx-auto py-6 px-3">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage Statistics</h1>
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
          {/* <ChainStats data={stats} /> */}
          <UsageStats data={stats} />
        </div>
      </div>
    </div>
  );
}