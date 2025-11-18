"use client";

import { useEffect, useRef, useState } from "react";
import DashboardHome from "@/components/dashboard/tabs/dashboard";
import QrPayment from "@/components/dashboard/tabs/qr-payment";
import PaymentSplit from "@/components/dashboard/tabs/payment-split";
import Swap from "@/components/dashboard/tabs/swap";
import Profile from "@/components/dashboard/tabs/profile";
// import AuthPage from "@/components/auth/AuthPage";
import Logout from "@/components/dashboard/tabs/logout";
import CreateAddressTab from "@/components/dashboard/tabs/create-address";
import History from "@/components/dashboard/tabs/history";
import Notifications from "@/components/dashboard/tabs/notifications";
import Help from "@/components/dashboard/tabs/help";
import ProtectedRoute from "@/components/auth/protected-route";
import { SideNav } from "@/components/dashboard/side-nav";
import { TopNav } from "@/components/dashboard/top-nav";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import SendFunds from "@/components/dashboard/tabs/send-funds";
import { ToastContainer } from "@/components/modals/toastContainer";
import { useNotifications } from "@/components/hooks/useNotifications";
import TopUp from "@/components/dashboard/tabs/top-up";
import { useDeposits } from "@/components/hooks";
import { useAuth } from "@/components/context/AuthContext";
import { useTokenMonitor } from "@/components/hooks/useTokenMonitor";
import { TokenExpiredDialog } from "@/components/modals/TokenExpiredDialog";
import Services from "@/components/dashboard/tabs/services";

export default function Dashboard() {
  const { checkDeposits } = useDeposits();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const { toasts, removeToast } = useNotifications();
  const checkRef = useRef(checkDeposits);
  useEffect(() => {
    checkRef.current = checkDeposits;
  }, [checkDeposits]);

  useEffect(() => {
    // Only start checking deposits once we have an auth token.
    if (!token) return;

    checkRef.current();

    const id = window.setInterval(() => {
      if (token) checkRef.current();
    }, 20000);

    return () => window.clearInterval(id);
  }, [token]);

  const { showExpiredDialog, handleRelogin } = useTokenMonitor();

  return (
    <ProtectedRoute>
      <div className="w-full flex-col bg-background mt-16 flex relative min-h-screen">
        <div className="flex relative w-full  overflow-y-scroll">
          <SideNav setTab={setActiveTab} activeTab={activeTab} />

          <div className="flex-1 relative lg:ml-64 overflow-x-auto">
            <TopNav tabTitle={activeTab} setTab={setActiveTab} />

            <div>
              {activeTab === "Dashboard" && (
                <DashboardHome activeTab={setActiveTab} />
              )}
              <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

              {activeTab === "QRPayment" && <QrPayment />}
              {activeTab === "Payment split" && <PaymentSplit />}
              {activeTab === "Swap" && <Swap />}
              {activeTab === "profile" && <Profile />}
              {activeTab === "Logout" && <Logout />}
              {activeTab === "Receive funds" && <CreateAddressTab />}
              {activeTab === "History" && <History />}
              {activeTab === "Notification" && <Notifications />}
              {activeTab === "Help" && <Help />}
              {activeTab === "Send" && <SendFunds />}
              {activeTab === "Top Up" && <TopUp />}
              {activeTab === "Services" && <Services />}
              <TokenExpiredDialog
                isOpen={showExpiredDialog}
                onRelogin={handleRelogin}
              />
              {/*  */}
            </div>
          </div>
        </div>

        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </ProtectedRoute>
  );
}
