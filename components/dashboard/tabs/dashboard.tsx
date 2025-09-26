// dashboard.tsx
"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Card } from "@/components/ui/Card";
import {
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Wallet,
  QrCode,
  Split,
  ArrowUpDown,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import { shortenAddress } from "@/components/lib/utils";
import Image from "next/image";
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

  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    totalTransactions: 0,
    activeSplits: 0,
    qrPayments: 0,
    revenueChange: 12.5,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const { addresses, loading: addressesLoading } = useWalletAddresses();

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setStats({
          totalBalance: 24567.89,
          totalTransactions: 142,
          activeSplits: 3,
          qrPayments: 28,
          revenueChange: 12.5,
        });

        setRecentActivity([
          {
            id: "1",
            type: "incoming",
            amount: "2500",
            token: "USDT",
            description: "Payment from Customer A",
            timestamp: "2 min ago",
            status: "completed",
          },
          {
            id: "2",
            type: "split",
            amount: "1500",
            token: "STRK",
            description: "Revenue split distributed",
            timestamp: "1 hour ago",
            status: "completed",
          },
          {
            id: "3",
            type: "swap",
            amount: "1000",
            token: "ETH",
            description: "ETH to NGN swap",
            timestamp: "3 hours ago",
            status: "completed",
          },
          {
            id: "4",
            type: "outgoing",
            amount: "500",
            token: "USDC",
            description: "Payment to Vendor B",
            timestamp: "1 day ago",
            status: "pending",
          },
        ]);

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

  const StatCard = ({
    title,
    value,
    change,
    icon,
    loading = false,
  }: {
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    loading?: boolean;
  }) => (
    <Card className="lg:p-6 p-2 flex-1 min-w-[120px] flex-col hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start ">
        <div className={` rounded-lg bg-opacity-10`}>{icon}</div>
        {change && (
          <span
            className={`text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-600"
              }`}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
          <p className="text-muted-foreground text-sm">{title}</p>
        </>
      )}
    </Card>
  );

  const ActivityIcon = ({ type, status }: { type: string; status: string }) => {
    const baseClasses = "p-2 hidden sm:flex rounded-full";

    if (status === "pending") {
      return (
        <div className={`${baseClasses} bg-yellow-100 text-yellow-600`}>
          <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (status === "failed") {
      return <div className={`${baseClasses} bg-red-100 text-red-600`}>⚠️</div>;
    }

    switch (type) {
      case "incoming":
        return (
          <div className={`${baseClasses} bg-green-100 text-green-600`}>
            <ArrowDownLeft size={16} />
          </div>
        );
      case "outgoing":
        return (
          <div className={`${baseClasses} bg-red-100 text-red-600`}>
            <ArrowUpRight size={16} />
          </div>
        );
      case "swap":
        return (
          <div className={`${baseClasses} bg-purple-100 text-purple-600`}>
            <ArrowUpDown size={16} />
          </div>
        );
      case "split":
        return (
          <div className={`${baseClasses} bg-blue-100 text-blue-600`}>
            <Users size={16} />
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-100 text-gray-600`}>
            <DollarSign size={16} />
          </div>
        );
    }
  };

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
