"use client";

import {
  LayoutDashboard,
  ArrowDownToLine,
  CreditCard,
  Split,
  ArrowLeftRight,
  History,
  HelpCircle,
  LogOut,
  Settings,
  Menu,
  User,
  Send,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "@/components/ui/buttons";
import { Card } from "../ui/cards";
import { ThemeToggle } from "../ui/theme-toggle";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, current: true },
  { name: "Receive funds", icon: ArrowDownToLine, current: false },
  { name: "QRPayment", icon: CreditCard, current: false },
  { name: "Send", icon: Send, current: false },
  { name: "Payment split", icon: Split, current: false },
  { name: "Services", icon: Wifi, current: false },
  { name: "Swap", icon: ArrowLeftRight, current: false },
  { name: "Top Up", icon: ArrowDownToLine, current: false },
  { name: "History", icon: History, current: false },
  { name: "Help", icon: HelpCircle, current: false },
];

interface SideNavProps {
  activeTab: string;
  setTab: (tab: string) => void;
}

export function SideNav({ activeTab, setTab }: SideNavProps) {
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border/50">
        <h1 className="text-foreground font-bold">
          <Link
            href={"/"}
            className="text-xl font-bold velo-text-gradient italic"
          >
            VELO
          </Link>
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="flex justify-end mb-3 items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Card className="p-0 w-fit">
            <button
              onClick={() => {
                setTab("profile");
                setOpen(false);
              }}
              className="p-1"
            >
              <User className="h-5 w-5 text-muted-foreground stroke-1" />
            </button>
          </Card>
        </div>

        {navigation.map((item) => (
          <Button
            key={item.name}
            variant={activeTab === item.name ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-11 text-sm font-medium transition-all duration-200",
              activeTab === item.name
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                : "text-sidebar-foreground hover:bg-velo-gradient/50  hover:text-sidebar-accent-foreground"
            )}
            onClick={() => {
              setTab(item.name);
              setOpen(false);
            }}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/50  space-y-1">
        <Button
          onClick={() => setTab("profile")}
          variant="ghost"
          className="w-full justify-start gap-3 h-11 hover:bg-primary/10"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setTab("Logout")}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden velo-gradient-subtle border border-border"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar">
          <SheetHeader>
            <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 w-64 hidden lg:block">
        <SidebarContent />
      </div>
    </>
  );
}
