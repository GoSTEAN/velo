// dashboard.tsx (updated)
"use client";

import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import { StatsCards } from "../stats-cards";
import { QuickActions } from "../quick-actions";
import { RecentActivity } from "../recent-activity";
import { WalletOverview } from "../wallet-overview";
import { useTotalBalance } from "@/components/hooks/useTotalBalance";

export interface DashboardProps {
  activeTab: React.Dispatch<React.SetStateAction<string>>;
}

export default function DashboardHome({ activeTab }: DashboardProps) {
  const { addresses, loading: addressesLoading } = useWalletAddresses();
  const { loading: balanceLoading } = useTotalBalance();

  const isLoading = addressesLoading || balanceLoading;

  if (isLoading) {
    return (
      <div className="w-full h-full p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-all duration-300 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-foreground text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your financial overview
          </p>
        </div>
      </div>

      <StatsCards/>
      
      <div className="bg-gradient-to-r mb-6 from-primary/5 to-accent/5 rounded-2xl p-4 lg:p-6 border border-primary/10">
        <h2 className="text-lg font-semibold mb-4 text-center lg:text-left">Quick Actions</h2>
        <QuickActions activeTab={activeTab} />
      </div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4 lg:space-y-6">
          <RecentActivity activeTab={activeTab}/>
        </div>
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <WalletOverview addresses={addresses}/>
        </div>
      </div>

      {/* Bottom CTA */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Need Help?</h3>
            <p className="opacity-90">Check our Help or contact support</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => activeTab("Help")}
              variant="secondary"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
            >
              Help
            </Button>
            <Button
              variant="primary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}