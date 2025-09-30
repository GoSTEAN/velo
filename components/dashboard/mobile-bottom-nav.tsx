"use client"

import { Button } from "@/components/ui/buttons"
import { QrCode, Send, ArrowDownToLine, History, Home } from "lucide-react"


interface MobileBottomNavProps {
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
}

const navItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: QrCode, label: "Qr Payment", active: false },
  { icon: Send, label: "Send", active: false },
  { icon: ArrowDownToLine, label: "Receive funds", active: false },
  { icon: History, label: "History", active: false },
]

export function MobileBottomNav({ activeTab, setActiveTab }: MobileBottomNavProps) {


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 lg:hidden shadow-2xl">
      <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-300 ${activeTab === item.label
                ? "text-primary bg-primary/10 scale-110"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
            onClick={() => setActiveTab(item.label)}
          >
            <div
              className={`p-1 rounded-lg transition-all duration-300 ${activeTab === item.label ? "bg-primary/20" : ""}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
            {activeTab === item.label  && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
          </Button>
        ))}
      </div>
    </div>
  )
}
