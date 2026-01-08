"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/buttons";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { WalletOverview } from "@/components/dashboard/wallet-overview";
import { useAuth } from "@/components/context/AuthContext";
import { useState, Suspense, lazy } from "react";
import Link from "next/link";

// Lazy load heavy components
const LazyStatsCards = lazy(() => import("@/components/dashboard/stats-cards").then(module => ({ default: module.StatsCardsComponent })));
const LazyQuickActions = lazy(() => import("@/components/dashboard/quick-actions").then(module => ({ default: module.QuickActions })));

// Loading skeleton component
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-muted/20 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-muted/20 rounded w-full"></div>
        </div>
      </Card>
    ))}
  </div>
);


export default function DashboardHome() {
  const { user } = useAuth();

  const [hideBalance, setHideBalance] = useState(false);

  const handleViewBalance = () => {
    console.log("Toggling balance visibility, current state:", hideBalance);
    setHideBalance(!hideBalance);
  };

  return (
    <div className="w-full h-full transition-all duration-300 p-6">
      {/* Header */}
      <div className="w-ull flex items-start">
      {/* <div className="space-y-3 mb-8 text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome back, {user?.firstName?.toLocaleUpperCase()}
        </h1>
        <p className="text-muted-foreground text-pretty text-lg">
          {"Ready to manage your finances? Let's make some magic happen."}
        </p>
      </div> */}


      </div>

      {/* Stats Grid */}
      <Suspense fallback={<StatsSkeleton />}>
        <LazyStatsCards
          handleViewBalance={handleViewBalance}
          hideBalance={hideBalance}
        />
      </Suspense>

      {/* Quick Actions */}
      <div className="space-y-4 lg:col-span-2 lg:space-y-6">
         {" "}
        </div>

      {/* Main Content Grid */}
      <Suspense fallback={<div className="h-48 bg-muted/20 rounded-lg animate-pulse" />}>
        <LazyQuickActions />
      </Suspense>
        
        {/* <div className=" space-y-4 lg:space-y-6">
          <RecentActivity />
        </div> */}

      {/* Bottom CTA */}
      <Card className="mt-8 p-6 border hidden md:block text-card-foreground border-border/50 mb-20 lg:mb-8 bg-card/50 backdrop-blur-sm shadow-md">
        <div className="flex flex-col w-full space-y-5 lg:flex-row justify-around items-center ">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Need Help?</h3>
            <p className="text-muted-foreground">
              Check our Help section for assistance
            </p>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="default">
              <Link href={"/dashboard/help"}>
                Help
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
