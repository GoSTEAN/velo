'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '../components/statsCard';
import { ChainStats } from '../components/chain-stats';
import { UsageStats } from '@/app/admin/components/usage-stats';
import { StatsData } from '@/types/admin';
import { getStats } from '@/lib/api';
import { useStats } from '@/components/hooks/useStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cards';
import { Button } from '@/components/ui/buttons';
import { RefreshCw } from 'lucide-react';
import Statistic from '@/components/landingpage/landing/stats';

// Cache key for localStorage
const STATS_CACHE_KEY = 'admin_dashboard_stats';
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedStats {
  data: StatsData;
  timestamp: number;
}

export default function DashboardPage() {
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
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <h4 className="font-semibold">Transaction Summary</h4>
                <ul className="mt-2 space-y-1">
                  <li>Total transactions across all chains: {stats.perChain.reduce((sum: number, chain: any) => sum + chain.count, 0)}</li>
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