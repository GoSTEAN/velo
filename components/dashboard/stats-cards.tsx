import { TrendingUp, TrendingDown, Activity, Users } from "lucide-react";
import { useTotalBalance } from "../hooks/useTotalBalance";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "../ui/cards";
import { useNotifications } from "../hooks/useNotifications";


export function StatsCards() {
  const { totalBalance, loading, error } = useTotalBalance();
  const { notifications } = useNotifications();
  const totalTransactions = notifications.filter((notification) => {
    return notification.title === "Deposit Received";
  });

  const stats = [
    {
      title: "Total Balance",
      value: "₦0.00",
      change: "+0%",
      trend: "up" as const,
      icon: TrendingUp,
      gradient: "bg-accent",
    },
    {
      title: "Transactions",
      value: totalTransactions.length | 0,
      change: "+8.2%",
      trend: "up" as const,
      icon: Activity,
      gradient: "bg-accent",
    },
    {
      title: "Active Splits",
      value: "3",
      change: "-2.1%",
      trend: "down" as const,
      icon: Users,
      gradient: "bg-accent",
    },
    {
      title: "QR Payments",
      value: "28",
      change: "+15.3%",
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
        value: loading ? "Loading..." : error ? "Error" : formattedBalance,
        change: loading || error ? "" : totalBalance > 0 ? "+0%" : "0%",
      };
    }
    return stat;
  });

  return (
    <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
      {updatedStats.map((stat, index) => (
        <Card
          className="border-border/50 bg-card/50 backdrop-blur-sm"
          key={index}
        >
          <div className="relative rounded-lg overflow-hidden ">
            <div className={``} />
            <div className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between  w-full">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {loading && stat.title === "Total Balance" ? (
                    <Skeleton className="h-8 w-32 bg-gray-300" />
                  ) : (
                    <p className="text-2xl font-bold text-balance">
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
