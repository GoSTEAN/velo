import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { shortenAddress } from "../lib/utils";
import Link from "next/link";

export function RecentActivity() {
  const { notifications } = useNotifications();

  const filtered = notifications.filter((notif) => {
    return (
      notif.title === "Deposit Successful" || notif.title === "Tokens Sent"
    );
  });

  const finalNotificationFix = filtered.slice(0, 5);

  return (
    <Card className="border-border/50 mb-8 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg lg:text-xl font-semibold">
          Recent Activity
        </CardTitle>
        <Link
          href={"/dashboard/history"}
          className="text-primary text-xs flex gap-3 items-center flex-none lg:text-sm"
        >
          View all
          <ChevronRight className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4">
        {finalNotificationFix.map((notification) => (
          <div
            className="w-full flex justify-between items-center p-2 rounded-lg"
            key={notification.id}
          >
            <div className="w-full flex gap-2 items-center">
              {notification.title === "Deposit Successful" && (
                <div className="w-8 h-8 rounded-full bg-green-100/90 flex items-center justify-center">
                  <ArrowDownLeft size={16} color="green" />
                </div>
              )}

              {notification.title === "Tokens Sent" && (
                <div className="w-8 h-8 rounded-full bg-red-100/90 flex items-center justify-center">
                  <ArrowUpRight size={16} color="red" />
                </div>
              )}

              <div className="flex flex-col gap-1 ">
                <h1 className="text-sm font-bold text-muted-foreground">
                  {notification.title}
                </h1>
                <h5 className="text-sm text-foreground">{notification.time}</h5>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-1 w-full items-end">
              {notification.title === "Deposit Successful" && (
                <div className="text-green-300 font-bold">
                  {notification.details.amount} {notification.details.chain}
                </div>
              )}

              {notification.title === "Tokens Sent" && (
                <div className="text-red-300 font-bold">
                  {notification.details.amount}
                </div>
              )}

              {notification.title === "Deposit Successful" && (
                <div>{shortenAddress(notification.details.address, 6)}</div>
              )}

              {notification.title === "Tokens Sent" && (
                <div>{shortenAddress(notification.details.txHash, 6)}</div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
