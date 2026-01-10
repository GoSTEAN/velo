"use client";

import type React from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { useNotifications } from "@/components/hooks/useNotifications";
import { useTokenMonitor } from "@/components/hooks/useTokenMonitor";
import { useRef, useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { useDeposits } from "@/components/hooks";
import { ToastContainer } from "@/components/modals/toastContainer";
import { TokenExpiredDialog } from "@/components/modals/TokenExpiredDialog";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { TopNav } from "@/components/dashboard/top-nav";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { checkDeposits } = useDeposits();
  const { token } = useAuth();

  const { toasts, removeToast } = useNotifications();
  const checkRef = useRef(checkDeposits);
  useEffect(() => {
    checkRef.current = checkDeposits;
  }, [checkDeposits]);

  useEffect(() => {
    if (!token) return;

    checkRef.current();

    const id = window.setInterval(() => {
      if (token) checkRef.current();
    }, 300000); // Check deposits every 5 minutes instead of 20 seconds

    return () => window.clearInterval(id);
  }, [token]);

  const { showExpiredDialog, handleRelogin } = useTokenMonitor();

  return (
    <ProtectedRoute>
      <div className="flex w-screen flex-col">
        <TopNav />
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

        <div className="mt-20 w-full md:max-w-[80%]  mx-auto relative">
          {children}
        </div>
        <MobileBottomNav />

        <TokenExpiredDialog
          isOpen={showExpiredDialog}
          onRelogin={handleRelogin}
        />
      </div>
    </ProtectedRoute>
  );
}
