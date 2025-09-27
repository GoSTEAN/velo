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
  Sparkles,
  User,
} from "lucide-react"
import { useState } from "react"
import { cn } from "../lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "@/components/ui/buttons";
import { Card } from "../ui/cards";
import { ThemeToggle } from "../ui/theme-toggle";
import { Image } from "@radix-ui/react-avatar";
import Link from "next/link";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";



const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, current: true },
  { name: "Receive funds", icon: ArrowDownToLine, current: false },
  { name: "Qr Payment", icon: CreditCard, current: false },
  { name: "Payment split", icon: Split, current: false },
  { name: "Swap", icon: ArrowLeftRight, current: false },
  { name: "History", icon: History, current: false },
  { name: "Help", icon: HelpCircle, current: false },
]

interface SideNavProps {
  activeTab: string;
  setTab: (tab: string) => void;
}


export function SideNav({ activeTab, setTab }: SideNavProps) {
  const [open, setOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-background to-muted/20">
      <div className="flex h-16 items-center px-6 border-b light-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center space-x-3">
          <h1 className="text-foreground  font-bold mb-4">
            <Link
              href={"/"}
              className="text-4xl font-bold font-[mono] italic rounded-b-2xl border-b-4 text-[#255ff1] "
            >
              VELO
            </Link>
          </h1>
        </div>
      </div>



      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="flex  justify-end mb-3 items-center gap-2">
          <div className="lg:hidden">
            <ThemeToggle />
          </div>

          <Card className="p-0 w-fit  lg:hidden">
            <button onClick={() => {
              setTab("profile")
              setOpen(false)
            }
            } className="p-1">
              <User className="h-5 w-5 text-muted-foreground stroke-1" />
            </button>
          </Card>
        </div>

        {navigation.map((item) => (
          <Button
            key={item.name}
            variant={activeTab === item.name ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-12 text-left transition-all duration-200",
              activeTab === item.name
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl"
                : "hover:bg-primary/10 hover:text-primary hover:translate-x-1",
            )}
            onClick={() => {
              setTab(item.name)   // 🔥 controlled from parent
              setOpen(false)      // close on mobile
            }}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t bg-muted/30 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-3 h-11 hover:bg-primary/10">
          <Settings className="h-5 w-5" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => (setTab("Logout") ) }
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border light-border hover:bg-primary/10"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-white">
          {/* ✅ Accessible hidden title */}
          <SheetHeader>
            <SheetTitle className="sr-only">
              {/* <VisuallyHidden>Sidebar Navigation</VisuallyHidden> */}
            </SheetTitle>
          </SheetHeader>

          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 w-64 bg-card border-r hidden lg:block">
        <SidebarContent />
      </div>
    </>
  )
}