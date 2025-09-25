
import { TrendingUp, TrendingDown, Activity, Users } from "lucide-react"
import { Card } from "../ui/Card"

const stats = [
  {
    title: "Total Balance",
    value: "₦24,567.89",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp,
    gradient: "bg-gradient-primary",
  },
  {
    title: "Transactions",
    value: "142",
    change: "+8.2%",
    trend: "up",
    icon: Activity,
    gradient: "bg-accent",
  },
  {
    title: "Active Splits",
    value: "3",
    change: "-2.1%",
    trend: "down",
    icon: Users,
    gradient: "bg-chart-3",
  },
  {
    title: "QR Payments",
    value: "28",
    change: "+15.3%",
    trend: "up",
    icon: TrendingUp,
    gradient: "bg-chart-4",
  },
];


export function StatsCards() {
  return (
    <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="relative rounded-lg overflow-hidden border-0 shadow-lg">
          <div className={`absolute inset-0 ${stat.gradient} opacity-10`} />
          <div className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-balance">{stat.value}</p>
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
