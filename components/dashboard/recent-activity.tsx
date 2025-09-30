import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards"
import { Button } from "@/components/ui/buttons"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  Users,
  DollarSign,
  ChevronRight,
} from "lucide-react"
import { DashboardProps } from "./tabs/dashboard"

const activities = [
  {
    id: 1,
    type: "incoming",
    description: "Payment from Customer A",
    amount: "2500",
    token: "USDT",
    timestamp: "2 min ago",
    status: "completed",
  },
  {
    id: 2,
    type: "split",
    description: "Revenue split distributed",
    amount: "1500",
    token: "STRK",
    timestamp: "1 hour ago",
    status: "completed",
  },
  {
    id: 3,
    type: "swap",
    description: "ETH to NGN swap",
    amount: "1000",
    token: "ETH",
    timestamp: "3 hours ago",
    status: "completed",
  },
  {
    id: 4,
    type: "outgoing",
    description: "Payment to Vendor B",
    amount: "500",
    token: "USDC",
    timestamp: "1 day ago",
    status: "pending",
  },
]

const ActivityIcon = ({ type, status }: { type: string; status: string }) => {
  const baseClasses = "p-2 hidden sm:flex rounded-full"

  if (status === "pending") {
    return (
      <div className={`${baseClasses} bg-yellow-100 text-yellow-600`}>
        <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (status === "failed") {
    return <div className={`${baseClasses} bg-red-100 text-red-600`}>⚠️</div>
  }

  switch (type) {
    case "incoming":
      return (
        <div className={`${baseClasses} bg-green-100 text-green-600`}>
          <ArrowDownLeft size={16} />
        </div>
      )
    case "outgoing":
      return (
        <div className={`${baseClasses} bg-red-100 text-red-600`}>
          <ArrowUpRight size={16} />
        </div>
      )
    case "swap":
      return (
        <div className={`${baseClasses} bg-purple-100 text-purple-600`}>
          <ArrowUpDown size={16} />
        </div>
      )
    case "split":
      return (
        <div className={`${baseClasses} bg-blue-100 text-blue-600`}>
          <Users size={16} />
        </div>
      )
    default:
      return (
        <div className={`${baseClasses} bg-gray-100 text-gray-600`}>
          <DollarSign size={16} />
        </div>
      )
  }
}

export function RecentActivity({
  activeTab,
}:DashboardProps) {
  return (
    <Card className="border-border/50 mb-8 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg lg:text-xl font-semibold">
          Recent Activity
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary text-xs lg:text-sm"
          onClick={() => activeTab("History")}
        >
          View all
          <ChevronRight className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-3 lg:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
              <ActivityIcon type={activity.type} status={activity.status} />
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-medium text-xs lg:text-sm truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              <div className="text-right">
                <p
                  className={`font-semibold text-xs lg:text-sm ${
                    activity.type === "incoming" ? "text-green-600" : ""
                  }`}
                >
                  {activity.type === "incoming" ? "+" : "-"}
                  {activity.amount} {activity.token}
                </p>
                <Badge
                  variant={
                    activity.status === "completed" ? "default" : "secondary"
                  }
                  className="text-xs capitalize"
                >
                  {activity.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
