import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Eye,
  EyeClosed,
} from "lucide-react";
import { useWalletData } from "../hooks/useWalletData"; // UPDATE: Use wallet data
// import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "../ui/cards";
import { useNotifications } from "../hooks/useNotifications";
import { Button } from "../ui/buttons";
import { useBalanceTrend } from "../hooks/useBalanceTrend"; // ADD: New hook

interface WalletOverviewProps {
  handleViewBalance: () => void;
  hideBalalance: boolean;
}

export function StatsCards({
  hideBalalance,
  handleViewBalance,
}: WalletOverviewProps) {
  const { totalBalance } = useWalletData(); // UPDATE
  const { notifications } = useNotifications();
  
  // ADD: Use the balance trend hook
  const balanceTrend = useBalanceTrend(totalBalance, !totalBalance);

  const totalTransactions = notifications.filter((notification) => {
    return notification.title === "Deposit Successful" || notification.title === "Tokens Sent";
  });

  const split = notifications.filter((notification) => {
    return notification.title === "Split Payment Created";
  });

  const qr = notifications.filter((notification) => {
    return notification.title === "Payment Completed";
  });

  // ADD: Format trend data for display
  const formatTrendData = (change: number, percentageChange: number, trend: 'up' | 'down' | 'same') => {
    if (trend === 'same') return { change: "0%", trend: 'same' as const };
    
    const sign = trend === 'up' ? '+' : '-';
    const absolutePercentage = Math.abs(percentageChange);
    
    return {
      change: `${sign}${absolutePercentage.toFixed(1)}%`,
      trend
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
    },
    {
      title: "Transactions",
      value: totalTransactions.length | 0,
      change: "",
      trend: "up" as const,
      icon: Activity,
      gradient: "bg-accent",
    },
    {
      title: "Active Splits",
      value: split.length | 0,
      change: "",
      trend: "down" as const,
      icon: Users,
      gradient: "bg-accent",
    },
    {
      title: "QRPayments",
      value: qr.length | 0,
      change: "",
      trend: "up" as const,
      icon: TrendingUp,
      gradient: "bg-accent",
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
    <div className="grid grid-cols-2 md:gap-6 gap-1 mb-6 md:grid-cols-4 lg:grid-cols-4">
      {updatedStats.map((stat, index) => (
        <Card
          className="border-border/50 bg-card/50 relative backdrop-blur-sm p-2"
          key={index}
        >
          {stat.title === "Total Balance" && (
            <Button
              onClick={handleViewBalance}
              variant="secondary"
              size="sm"
              className="mt-2 w-fit absolute bottom-2 right-2"
            >
              {hideBalalance ? <EyeClosed size={14} /> : <Eye size={14} />}
            </Button>
          )}

          <div className="relative rounded-lg overflow-hidden">
            <div className={``} />
            <div className="md:p-6 p-2 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
              
                      {hideBalalance ? (
                        <div className="text-muted-foreground font-bold">
                          -------
                        </div>
                      ) : (
                        <p className=" font-bold text-balance">
                          {stat.value}
                        </p>
                      )}
                 
                  {stat.change && (
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" && (
                        <TrendingUp className="h-3 w-3 text-primary" />
                      )}
                      {stat.trend === "down" && (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span
                        className={
                          stat.trend === "up"
                            ? "text-primary text-xs font-medium"
                            : stat.trend === "down"
                            ? "text-destructive text-xs font-medium"
                            : "text-muted-foreground text-xs font-medium"
                        }
                      >
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}