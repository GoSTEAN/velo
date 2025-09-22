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
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import { shortenAddress } from "@/components/lib/utils";
import Image from "next/image";

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

interface DashboardProps {
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
            className={`text-sm font-medium ${
              change >= 0 ? "text-green-600" : "text-red-600"
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-foreground text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back Tali! Here&apos;s your financial overview
          </p>
        </div>
      </div>

     
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Balance"
              value={`₦${stats.totalBalance.toLocaleString()}`}
              change={stats.revenueChange}
              icon={<Wallet className="text-blue-600" size={20} />}
            />
            <StatCard
              title="Transactions"
              value={stats.totalTransactions.toString()}
              icon={<TrendingUp className="text-green-600" size={20} />}
            />
            <StatCard
              title="Active Splits"
              value={stats.activeSplits.toString()}
              icon={<Users className="text-purple-600" size={20} />}
            />
            <StatCard
              title="QR Payments"
              value={stats.qrPayments.toString()}
              icon={<QrCode className="text-orange-600" size={20} />}
            />
          </div>
          {/* quick Actions */}
          <div className="flex md:hidden w-fit flex-col mx-auto gap-3">
            <h1 className="text-custom-lg font-bold text-foreground">Quick actions</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-6 w-full max-w-177 mx-auto">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => activeTab(action.title)}
                  variant="tertiary"
                  size="xxs"
                  className="flex items-center w-fit min-w-30  hover:bg-hover rounded-lg border border-border justify-between"
                >
                  <div
                    className={`p-3 rounded-xl  bg-opacity-10 group-hover:scale-110 transition-transform`}
                  >
                    {React.cloneElement(action.icon, {
                      className: `text-${action.color.split("-")[1]}-600`,
                    })}
                  </div>
                  <h3 className="text-foreground text-custom-md font-semibold ">
                    {action.title}
                  </h3>
                  <ChevronRight
                    size={20}
                    className="text-muted-foreground group-hover:text-foreground transition-colors"
                  />
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card className="p-6 flex-col max-h-170 overflow-y-scroll">
              <div className="flex justify-between w-full items-center mb-6">
                <h2 className="text-foreground text-xl font-semibold">
                  Recent Activity
                </h2>
                <Button
                  variant="secondary"
                  className="flex flex-none"
                  size="xxs"
                  onClick={() => activeTab("History")}
                >
                  View All <ChevronRight className="ml-2" size={16} />
                </Button>
              </div>

              <div className="space-y-4 w-full">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3  text-foreground hover:text-hover rounded-lg hover:bg-hover transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gsp-2">

                    </div>
                    <ActivityIcon
                      type={activity.type}
                      status={activity.status}
                    />

                    <div className="flex-1 min-w-0">
                      <p className=" font-medium text-sm truncate">
                        {activity.description}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {activity.timestamp}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-semibold text-sm ${
                          activity.type === "incoming"
                            ? "text-green-600"
                            : ""
                        }`}
                      >
                        {activity.type === "incoming" ? "+" : "-"}
                        {activity.amount} {activity.token}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : activity.status === "pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Wallet Overview */}
            <Card className="p-6 flex-col">
              <div className="flex justify-between items-center w-full mb-6">
                <h2 className="text-foreground text-xl font-semibold">
                  Wallet Overview
                </h2>
                <Button
                  variant="secondary"
                  className="flex flex-none"
                  size="xxs"
                  onClick={() => (window.location.href = "#create-address")}
                >
                  Manage <ChevronRight size={16} />
                </Button>
              </div>

              <div className="space-y-4">
                {addresses?.slice(0, 4).map((wallet, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                        <Image
                          src={`/${wallet.chain.toLowerCase()}.svg`}
                          alt={wallet.chain}
                          width={16}
                          height={16}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            (
                              e.target as HTMLImageElement
                            ).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <span className="text-xs font-bold hidden">
                          {wallet.chain.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          {wallet.chain}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {shortenAddress(wallet.address as `0x${string}`, 6)}
                        </p>
                      </div>
                    </div>

                    <Button variant="secondary" size="xs">
                      <Eye size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
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
