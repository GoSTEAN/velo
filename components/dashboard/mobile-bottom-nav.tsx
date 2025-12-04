"use client";

import { QrCode, Send, ArrowDownToLine, History, Home, Bell, User, HistoryIcon } from "lucide-react";
import Link from "next/link";

const navItems = [
  { icon: Home, label: "Dashboard", link: "/dashboard" },
  { icon: Bell, label: "Notification", link: "/dashboard/notifications" },
  { icon: HistoryIcon, label: "History", link: "/dashboard/history" },
  { icon: User, label: "Profile", link: "/dashboard/profile" },
];

export function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 lg:hidden shadow-2xl">
      <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto overflow-auto">
        {navItems.map((item, index) => (
          <Link
            href={item.link}
            key={index}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-300 `}
          >
            <div className={`p-1 rounded-lg transition-all duration-300 `}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
