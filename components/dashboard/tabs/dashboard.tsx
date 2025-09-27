// dashboard.tsx
"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Card } from "@/components/ui/Card";
import {
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Users,

  Wallet,
  QrCode,
  Split,
  ArrowUpDown,
 
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWalletAddresses } from "@/components/hooks/useAddresses";

import { StatsCards } from "../stats-cards";
import { QuickActions } from "../quick-actions";
import { RecentActivity } from "../recent-activity";
import { WalletOverview } from "../wallet-overview";
import { useAuth } from "@/components/context/AuthContext";

interface DashboardStats {
  totalBalance: number;
  totalTransactions: number;
  activeSplits: number;
  qrPayments: number;
  revenueChange: number;
}

interface RecentActivity {
  id: string;
  type: "incoming" | "outgoing" | "swap" | "split";
  amount: string;
  token: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

export interface DashboardProps {
  activeTab: Dispatch<SetStateAction<string>>;
}
export default function DashboardHome({ activeTab }: DashboardProps) {


  const [isLoading, setIsLoading] = useState(true);
  const {user} = useAuth();

  const { addresses, loading: addressesLoading } = useWalletAddresses();

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {

      

        setIsLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      icon: <QrCode size={24} />,
      title: "Qr Payment",
      description: "Create payment request",
      action: "Create",
      route: "qr-payment",
      color: "bg-blue-500",
    },
    {
      icon: <Split size={24} />,
      title: "Payment split",
      description: "Split revenue automatically",
      action: "Setup",
      route: "payment-split",
      color: "bg-green-500",
    },
    {
      icon: <ArrowUpDown size={24} />,
      title: "Swap",
      description: "Exchange tokens to Naira",
      action: "Swap",
      route: "swap",
      color: "bg-purple-500",
    },
    {
      icon: <Wallet size={24} />,
      title: "Receive funds",
      description: "Get your wallet addresses",
      action: "View",
      route: "create-address",
      color: "bg-orange-500",
    },
  ];



 

  if (isLoading || addressesLoading) {
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
      
      <div className="space-y-3 mb-8  text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome back, {user?.firstName?.toLocaleUpperCase()} 
        </h1>
        <p className="text-muted-foreground text-pretty text-lg">
          {"Ready to manage your finances? Let's make some magic happen."}
        </p>
      </div>


      <>
        {/* Stats Grid */}
        <StatsCards />


        {/* quick Actions */}
        <div className="bg-gradient-to-r mb-6 from-primary/5 to-accent/5 rounded-2xl p-4 lg:p-6 border border-primary/10">
          <h2 className="text-lg font-semibold mb-4 text-center lg:text-left">Quick Actions</h2>
          <QuickActions activeTab={activeTab} />
        </div>


        <div className="grid gap-4 lg:gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            <RecentActivity activeTab={activeTab} />
          </div>
          <div className="space-y-4 lg:col-span-2 lg:space-y-6">
            <WalletOverview addresses={addresses} />
          </div>
        </div>
      </>

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
