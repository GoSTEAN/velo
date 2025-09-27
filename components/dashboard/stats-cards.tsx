// components/stats-cards.tsx
import { TrendingUp, TrendingDown, Activity, Users } from "lucide-react"
import { useTotalBalance } from "../hooks/useTotalBalance"
import { Skeleton } from "@/components/ui/skeleton"

const stats = [
  {
    title: "Total Balance",
    value: "₦0.00",
    change: "+0%",
    trend: "up" as const,
    icon: TrendingUp,
    gradient: "bg-gradient-primary",
  },
  {
    title: "Transactions",
    value: "142",
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
    gradient: "bg-chart-3",
  },
  {
    title: "QR Payments",
    value: "28",
    change: "+15.3%",
    trend: "up" as const,
    icon: TrendingUp,
    gradient: "bg-chart-4",
  },
];

export function StatsCards() {
  const { totalBalance, loading, error } = useTotalBalance();

  const formattedBalance = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(totalBalance);

  const updatedStats = stats.map((stat, index) => {
    if (index === 0) { // Total Balance card
      return {
        ...stat,
        value: loading ? "Loading..." : error ? "Error" : formattedBalance,
        change: loading || error ? "" : totalBalance > 0 ? "+0%" : "0%"
      };
    }
    return stat;
  });

  return (
    <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
      {updatedStats.map((stat, index) => (
        <div key={index} className="relative rounded-lg overflow-hidden border-0 shadow-lg">
          <div className={`absolute inset-0 ${stat.gradient} opacity-10`} />
          <div className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                {loading && stat.title === "Total Balance" ? (
                  <Skeleton className="h-8 w-32 bg-gray-300" />
                ) : (
                  <p className="text-2xl font-bold text-balance">{stat.value}</p>
                )}
                {stat.change && (
                  <div className="flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-accent" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === "up" ? "text-accent" : "text-destructive"}`}>
                      {stat.change}
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.gradient}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}