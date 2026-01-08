"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/buttons";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { WalletOverview } from "@/components/dashboard/wallet-overview";
import { useAuth } from "@/components/context/AuthContext";
import { useState } from "react";
import Link from "next/link";

interface RecentActivity {
  id: string;
  type: "incoming" | "outgoing" | "swap" | "split";
  amount: string;
  token: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}


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
      <StatsCards
        handleViewBalance={handleViewBalance}
        hideBalance={hideBalance}
      />

      {/* Quick Actions */}
      <div className="space-y-4 lg:col-span-2 lg:space-y-6">
         {" "}
        </div>

      {/* Main Content Grid */}
      <QuickActions  />
        
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
