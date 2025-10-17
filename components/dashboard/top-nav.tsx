"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/buttons";
import { Search, RefreshCw, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Notification from "@/components/ui/notification";
import { Card } from "@/components/ui/Card";
// import { useDeposits } from "../hooks";

interface DashboardHeaderProps {
  tabTitle: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
}

export function TopNav({ tabTitle, setTab }: DashboardHeaderProps) {
  // const { checkDeposits } = useDeposits();
const [searchOpen, setSearchOpen] = useState(false);

// Automatically start checking deposits when component mounts
  // const checkRef = useRef(checkDeposits);
  //   useEffect(() => {
  //     checkRef.current = checkDeposits;
  //   }, [checkDeposits]);

  //   useEffect(() => {
  //     // run once immediately
  //     checkRef.current();

  //     const id = window.setInterval(() => {
  //       checkRef.current();
  //     }, 20000);

  //     return () => window.clearInterval(id);
  //   }, []);
;
return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Actions */}
        <div className="text-2xl hidden lg:flex font-black text-foreground">{tabTitle }</div>
        <div className="flex items-center gap-2 lg:gap-4 ml-auto">
          {/* Desktop search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search transactions..."
              className="pl-10 w-60 lg:w-80 py-1 rounded-3xl bg-muted/50 border-primary/20 focus:border-primary/40"
            />
          </div>

          {/* Mobile search sheet */}
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-24 bg-white">
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search transactions..."
                  className="pl-10 w-full bg-muted/50 py-1 rounded-3xl"
                />
              </div>
            </SheetContent>
          </Sheet>

          <Notification onclick={setTab} />

          <div className="">
            <ThemeToggle />
          </div>

          <Card className="p-0 w-fit hidden lg:block">
            <button onClick={() => setTab("profile")} className="p-1">
              <User className="h-5 w-5 text-muted-foreground stroke-1" />
            </button>
          </Card>
        </div>
      </div>
    </header>
  );
}
