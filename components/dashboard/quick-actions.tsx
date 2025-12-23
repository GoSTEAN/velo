import {
  QrCode,
  Users,
  Send,
  ArrowDownToLine,
  Lightbulb,
  Wifi,
  Phone,
  ArrowUpToLine,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/cards";
import { Button } from "../ui/buttons";
import { Dispatch, SetStateAction } from "react";
import Link from "next/link";

interface quickActionProps {
  setTab: Dispatch<SetStateAction<string>>;
}
const actions = [
  {
    title: "Airtime",
    link: "/dashboard/service/airtime",
    icon: Phone,
    gradient: "from-accent to-secondary",
  },
  {
    title: "Data",
    link: "/dashboard/service/data",
    icon: Wifi,
    gradient: "from-char-2 to-accent",
  },
  {
    title: "Electricity",
    link: "/dashboard/service/electricity",
    icon: Lightbulb,
    gradient: "from-primary to-success",
  },
  {
    title: "QRPayment",
    link: "/dashboard/merchant",
    icon: QrCode,
    gradient: "from-primary to-accent",
  },
  {
    title: "Payment split",
    link: "/dashboard/split",
    icon: Users,
    gradient: "from-success to-chart-2",
  },
  {
    title: "Send",
    link: "/dashboard/send",
    icon: Send,
    gradient: "from-chart-3 to-chart-4",
  },
  {
    title: "Receive funds",
    link: "/dashboard/receive",
    icon: ArrowDownToLine,
    gradient: "from-primary to-chart-2",
  },
  {
    title: "Top Up",
    link: "/dashboard/topup",
    icon: ArrowUpToLine,
    gradient: "from-primary to-accent",
  },
];

export function QuickActions() {
  return (
    <div className="border-border/50 mb-8 p-2 md:p-4  backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid w-full  sm:gap-4 grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.link}
                className="h-auto items-center justify-center flex border flex-col rounded-2xl gap-4 py-4 px-6 bg-muted/30 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className={`rounded-xl w-fit p-2 bg-gradient-to-br ${action.gradient} shadow-lg`} >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">{action.title}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </div>
  );
}
