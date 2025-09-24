
import { QrCode, Repeat, Send, Download, Sparkles } from "lucide-react"

import Button from "../ui/Button"
import { Dispatch, SetStateAction } from "react";

const actions = [
  {
    title: "Qr Payment",
    description: "Scan or generate QR codes",
    icon: QrCode,
    gradient: "from-blue-500 to-blue-600",
    hoverGradient: "hover:from-blue-600 hover:to-blue-700",
    action: "Create",
    route: "qr-payment",
  },
  {
    title: "Payment Split",
    description: "Split payments with others",
    icon: Repeat,
    gradient: "from-emerald-500 to-emerald-600",
    hoverGradient: "hover:from-emerald-600 hover:to-emerald-700",
    action: "Setup",
    route: "payment-split",
  },
  {
    title: "Send Money",
    description: "Transfer to any wallet",
    icon: Send,
    gradient: "from-purple-500 to-purple-600",
    hoverGradient: "hover:from-purple-600 hover:to-purple-700",
    action: "Swap",
    route: "swap",
  },
  {
    title: "Receive Funds",
    description: "Get paid instantly",
    icon: Download,
    gradient: "from-orange-500 to-orange-600",
    hoverGradient: "hover:from-orange-600 hover:to-orange-700",
    action: "View",
    route: "create-address",
  },
];

interface DashboardProps {
    activeTab: Dispatch<SetStateAction<string>>;

}

export function QuickActions({ activeTab }: DashboardProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {actions.map((action, index) => (
                <Button
                    key={index}
                    onClick={() => activeTab(action.title)}
                    className={`h-auto p-4 lg:p-6 flex flex-col items-center gap-3 bg-gradient-to-br ${action.gradient} ${action.hoverGradient} text-white border-0 shadow-lg hover:shadow-xl  cursor-pointer transition-transform duration-500 hover:scale-105 group`}
                >
                    <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                        <action.icon className=" lg:h-7 lg:w-7" size={10} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-sm lg:text-base mb-1">{action.title}</p>
                        <p className="text-xs lg:text-sm text-white/80 text-pretty hidden sm:block">{action.description}</p>
                    </div>
                    <Sparkles className="h-3 w-3 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
            ))}
        </div>
    )
}
