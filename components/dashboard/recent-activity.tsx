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
import { useAuth } from "@/components/context/AuthContext"
import { useState, useEffect } from "react"

interface ActivityTransaction {
  id: string;
  type: "incoming" | "outgoing" | "swap" | "split";
  description: string;
  amount: string;
  token: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  txHash?: string;
}

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

// Helper function to convert backend transaction to activity format
const convertTransactionToActivity = (transaction: any): ActivityTransaction => {
  // Determine activity type based on transaction type and addresses
  let type: "incoming" | "outgoing" | "swap" | "split" = "outgoing";
  let description = "";
  
  if (transaction.type === "send") {
    type = "outgoing";
    description = `Sent ${transaction.currency} to ${transaction.toAddress?.slice(0, 8)}...`;
  } else if (transaction.type === "receive") {
    type = "incoming";
    description = `Received ${transaction.currency} from ${transaction.fromAddress?.slice(0, 8)}...`;
  } else if (transaction.type === "swap") {
    type = "swap";
    description = `${transaction.fromCurrency} to ${transaction.toCurrency} swap`;
  } else if (transaction.type === "split") {
    type = "split";
    description = "Revenue split distributed";
  } else {
    // Fallback based on amount or other properties
    type = transaction.amount?.startsWith('-') ? "outgoing" : "incoming";
    description = `${transaction.type} transaction`;
  }

  // Convert status
  let status: "completed" | "pending" | "failed" = "completed";
  if (transaction.status === "pending" || transaction.status === "processing") {
    status = "pending";
  } else if (transaction.status === "failed" || transaction.status === "error") {
    status = "failed";
  }

  return {
    id: transaction.id,
    type,
    description,
    amount: Math.abs(parseFloat(transaction.amount)).toString(),
    token: transaction.currency,
    timestamp: new Date(transaction.timestamp).toRelativeTime(),
    status,
    txHash: transaction.txHash
  };
}

export function RecentActivity({
  activeTab,
}: DashboardProps) {
  const { getTransactionHistory } = useAuth();
  const [activities, setActivities] = useState<ActivityTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setLoading(true);
        // Fetch recent transactions (last 4)
        const response = await getTransactionHistory(1, 4);
        const transactions = response.transactions || [];
        
        // Convert to activity format and sort by timestamp (newest first)
        const recentActivities = transactions
          .map(convertTransactionToActivity)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 4); // Take only 4 most recent

        setActivities(recentActivities);
      } catch (err) {
        console.error('Failed to fetch recent transactions:', err);
        setError('Failed to load recent activity');
        // Fallback to empty array
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [getTransactionHistory]);

  // Fallback mock data if no real transactions
  const fallbackActivities: ActivityTransaction[] = [
    {
      id: "1",
      type: "incoming",
      description: "No recent transactions",
      amount: "0",
      token: "ETH",
      timestamp: "Just now",
      status: "completed",
    }
  ];

  const displayActivities = activities.length > 0 ? activities : fallbackActivities;

  return (
    <Card className="border-0 shadow-lg">
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading recent activity...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        ) : (
          displayActivities.map((activity) => (
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
          ))
        )}
      </CardContent>
    </Card>
  )
}