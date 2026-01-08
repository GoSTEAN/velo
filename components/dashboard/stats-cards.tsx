import * as React from "react";
import {
  TrendingUp,
  Activity,
  Users,
  Eye,
  EyeClosed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useWalletData } from "../hooks/useWalletData";
import { useNotifications } from "../hooks/useNotifications";
import { useBalanceTrend } from "../hooks/useBalanceTrend";
import { WalletOverview } from "./wallet-overview";
import { useState, useRef, useEffect } from "react";
import { Card } from "../ui/Card";
import { useDashboardStats } from "../hooks/useDashboardStats";

interface WalletOverviewProps {
  handleViewBalance: () => void;
  hideBalance: boolean;
}

export function StatsCards({
  hideBalance,
  handleViewBalance,
}: WalletOverviewProps) {
  const { totalBalance } = useWalletData();
  const { notifications } = useNotifications();
  const { totalTransactions, activeSplits, qrPayments, isLoading: statsLoading } = useDashboardStats();
  const [balanceToggle, setBalanceToggle] = useState(false);
  const [transactionsToggle, setTransactionsToggle] = useState(false);
  const [splitsToggle, setSplitsToggle] = useState(false);
  const [qrToggle, setQrToggle] = useState(false);
  const balanceTrend = useBalanceTrend(totalBalance, !totalBalance);

  // Refs for dropdown containers
  const balanceRef = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);
  const splitsRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (balanceRef.current && !balanceRef.current.contains(event.target as Node)) {
        setBalanceToggle(false);
      }
      if (transactionsRef.current && !transactionsRef.current.contains(event.target as Node)) {
        setTransactionsToggle(false);
      }
      if (splitsRef.current && !splitsRef.current.contains(event.target as Node)) {
        setSplitsToggle(false);
      }
      if (qrRef.current && !qrRef.current.contains(event.target as Node)) {
        setQrToggle(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setBalanceToggle(false);
        setTransactionsToggle(false);
        setSplitsToggle(false);
        setQrToggle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatTrendData = (
    change: number,
    percentageChange: number,
    trend: "up" | "down" | "same"
  ) => {
    if (trend === "same") return { change: "0%", trend: "same" as const };

    const sign = trend === "up" ? "+" : "-";
    const absolutePercentage = Math.abs(percentageChange);

    return {
      change: `${sign}${absolutePercentage.toFixed(1)}%`,
      trend,
    };
  };

  const balanceTrendData = formatTrendData(
    balanceTrend.change,
    balanceTrend.percentageChange,
    balanceTrend.trend
  );

  const stats = [
    {
      title: "Total Balance",
      value: "₦0.00",
      change: balanceTrendData.change,
      trend: balanceTrendData.trend,
      icon: TrendingUp,
      gradient: "bg-accent",
      toggle: balanceToggle,
      setToggle: setBalanceToggle,
    },
    {
      title: "Transactions",
      value: statsLoading ? "Loading..." : totalTransactions.toString(),
      change: "",
      trend: "up" as const,
      icon: Activity,
      gradient: "bg-accent",
      toggle: transactionsToggle,
      setToggle: setTransactionsToggle,
    },
    {
      title: "Active Splits",
      value: statsLoading ? "Loading..." : activeSplits.toString(),
      change: "",
      trend: "down" as const,
      icon: Users,
      gradient: "bg-accent",
      toggle: splitsToggle,
      setToggle: setSplitsToggle,
    },
    {
      title: "QRPayments",
      value: statsLoading ? "Loading..." : qrPayments.toString(),
      change: "",
      trend: "up" as const,
      icon: TrendingUp,
      gradient: "bg-accent",
      toggle: qrToggle,
      setToggle: setQrToggle,
    },
  ];

  const formattedBalance = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(totalBalance);

  const updatedStats = stats.map((stat, index) => {
    if (index === 0) {
      return {
        ...stat,
        value: !formattedBalance ? "Loading..." : formattedBalance,
      };
    }
    return stat;
  });

  return (
    <div className="flex md:grid-cols-3 sm:grid sm:grid-cols-2  w-full lg:grid-cols-4 gap-6 overflow-x-scroll mb-6 ">
      {updatedStats.map((stat, index) => (
        <div 
          className="border-border/50 min-w-full bg-muted/30 relative backdrop-blur-sm p-2" 
          key={index}
          ref={
            stat.title === "Total Balance" ? balanceRef :
            stat.title === "Transactions" ? transactionsRef :
            stat.title === "Active Splits" ? splitsRef :
            qrRef
          }
        >
          <div className="relative rounded-lg overflow-hidden">
            <div className={``} />
            <div className="md:p-6 p-2 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-8 w-full">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>

                    {stat.title === "Total Balance" && (
                      <button
                        onClick={() => {
                          console.log("Eye button clicked");
                          handleViewBalance();
                        }}
                        className="p-1 h-6 w-6 rounded-md hover:bg-muted/50 transition-colors"
                        title={hideBalance ? "Show balance" : "Hide balance"}
                      >
                        {hideBalance ? <EyeClosed size={14} /> : <Eye size={14} />}
                      </button>
                    )}

                    <button
                      onClick={() => stat.setToggle(!stat.toggle)}
                      className="p-1 rounded-md hover:bg-muted/50 transition-colors duration-200"
                      title={stat.toggle ? "Collapse" : "Expand"}
                    >
                      {stat.toggle ? (
                        <ChevronUp className="h-5 w-5 text-primary transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-primary transition-transform duration-200" />
                      )}
                    </button>
                  </div>

                  {hideBalance ? (
                    <div className="text-muted-foreground font-bold">
                      -------
                    </div>
                  ) : (
                    <p className=" font-bold text-balance">{stat.value}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {balanceToggle && (
        <div ref={balanceRef}>
          <WalletOverview
            handleViewBalance={handleViewBalance}
            hideBalance={hideBalance}
          />
        </div>
      )}

      {transactionsToggle && (
        <div ref={transactionsRef} className="col-span-full mt-4 animate-in slide-in-from-top-2 duration-200">
          <Card className="p-4 border-border/50">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statsLoading ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2 animate-pulse" />
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
              ) : totalTransactions > 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">{totalTransactions} total transactions</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Transaction details available in history</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Your transaction history will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {splitsToggle && (
        <div ref={splitsRef} className="col-span-full mt-4 animate-in slide-in-from-top-2 duration-200">
          <Card className="p-4 border-border/50">
            <h3 className="text-lg font-semibold mb-4">Active Payment Splits</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statsLoading ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2 animate-pulse" />
                  <p className="text-muted-foreground">Loading splits...</p>
                </div>
              ) : activeSplits > 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">{activeSplits} active payment splits</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Manage your splits in the dashboard</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">No active splits found</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Create payment splits to see them here</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {qrToggle && (
        <div ref={qrRef} className="col-span-full mt-4 animate-in slide-in-from-top-2 duration-200">
          <Card className="p-4 border-border/50">
            <h3 className="text-lg font-semibold mb-4">QR Payment History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statsLoading ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2 animate-pulse" />
                  <p className="text-muted-foreground">Loading QR payments...</p>
                </div>
              ) : qrPayments > 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">{qrPayments} QR payments completed</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Payment details available in history</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">No QR payments found</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">QR payment history will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}