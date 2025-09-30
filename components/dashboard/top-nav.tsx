"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/buttons";
import { Search, RefreshCw, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Notification from "@/components/ui/notification";
import { Card } from "@/components/ui/Card";
import { useAuth } from "../context/AuthContext";

interface DashboardHeaderProps {
  tabTitle: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
}

export function TopNav({ tabTitle, setTab }: DashboardHeaderProps) {
  const { checkDeposits } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleCheckDeposits = async () => {
    try {
      console.log("checking deposits...");
      const result = await checkDeposits();
      console.log(result.message);
    } catch (error) {
      console.error("Failed to check deposits:", error);
    }
  };

  // Automatically start checking deposits when component mounts
  useEffect(() => {
    handleCheckDeposits();
    const intervalId = setInterval(handleCheckDeposits, 20000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Actions */}
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

          {/* Refresh */}
          <Button
            onClick={handleCheckDeposits}
            variant="ghost"
            size="icon"
            className="hidden sm:flex hover:bg-primary/10"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>

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
