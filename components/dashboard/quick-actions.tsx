import { QrCode, Users, Send, ArrowDownToLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/cards";
import { Button } from "../ui/buttons";
import { Dispatch, SetStateAction } from "react";

interface quickActionProps {
  setTab: Dispatch<SetStateAction<string>>;
}
const actions = [
  {
    title: "QRPayment",
    description: "Scan or generate QR codes",
    icon: QrCode,
    gradient: "from-primary to-accent",
  },
  {
    title: "Payment split",
    description: "Split payments with others",
    icon: Users,
    gradient: "from-success to-chart-2",
  },
  {
    title: "Send",
    description: "Transfer to any wallet",
    icon: Send,
    gradient: "from-chart-3 to-chart-4",
  },
  {
    title: "Receive funds",
    description: "Get paid instantly",
    icon: ArrowDownToLine,
    gradient: "from-accent to-primary",
  },
  {
    title: "Top Up",
    description: "Buy crypto with NGN",
    icon: ArrowDownToLine,
    gradient: "from-primary to-accent",
  },
];

export function QuickActions({ setTab }: quickActionProps) {
  return (
    <Card className="border-border/50 mb-8 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                onClick={() => setTab(action.title)}
                key={action.title}
                variant="outline"
                className="h-auto flex-col gap-4 p-6 bg-transparent border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div
                  className={`rounded-xl p-3 bg-gradient-to-br ${action.gradient} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
