"use client";



import {
  HelpCircle,
  LogOut,

} from "lucide-react";
import { useState } from "react";
import DashboardHome from "@/components/dashboard/tabs/dashboard";
import QrPayment from "@/components/dashboard/tabs/qr-payment";
import PaymentSplit from "@/components/dashboard/tabs/payment-split";
import Swap from "@/components/dashboard/tabs/swap";
import Profile from "@/components/dashboard/tabs/profile";
import AuthPage from "@/components/auth/AuthPage";
import Logout from "@/components/dashboard/tabs/logout";
import CreateAddressTab from "@/components/dashboard/tabs/create-address";
import History from "@/components/dashboard/tabs/history";
import Notifications from "@/components/dashboard/tabs/notifications";
import Help from "@/components/dashboard/tabs/help";
import ProtectedRoute from "@/components/auth/protected-route";
import {
  UserGroup02Icon,
  Exchange03Icon,
  DashboardSquare02FreeIcons,
  AddressBookIcon,
  TransactionHistoryIcon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SideNav } from "@/components/dashboard/side-nav";
import { TopNav } from "@/components/dashboard/top-nav";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showNav, setShowNav] = useState(false);

  const sideNavTab = [
    {
      icon: <HugeiconsIcon icon={DashboardSquare02FreeIcons} size={25} />,
      name: "Dashboard",
    },
    {
      icon: <HugeiconsIcon icon={AddressBookIcon} size={25} />,
      name: "Receive funds",
    },
    {
      icon: <HugeiconsIcon icon={QrCodeIcon} size={25} />,
      name: "Qr Payment",
    },
    {
      icon: <HugeiconsIcon icon={UserGroup02Icon} size={25} />,

      name: "Payment split",
    },
    {
      icon: <HugeiconsIcon icon={Exchange03Icon} size={25} />,

      name: "Swap",
    },
    {
      icon: <HugeiconsIcon icon={TransactionHistoryIcon} size={25} />,
      name: "History",
    },
    {
      icon: <HelpCircle size={25} />,
      name: "Help",
    },
    {
      icon: <LogOut size={25} />,
      name: "Logout",
    },
  ];
  return (
    <ProtectedRoute>
      <div className="w-full flex-col bg-background flex relative min-h-screen">

        <div className="flex relative w-full  overflow-y-scroll">
          <SideNav setTab={setActiveTab} activeTab={activeTab} />

          <div className="flex-1 relative lg:ml-64 overflow-x-auto">
            <TopNav tabTitle={activeTab} setTab={setActiveTab} />

            <div>
              {activeTab === "Dashboard" && (
                <DashboardHome activeTab={setActiveTab} />
              )}

              {activeTab === "Qr Payment" && <QrPayment />}
              {activeTab === "Payment split" && <PaymentSplit />}
              {activeTab === "Swap" && <Swap />}
              {activeTab === "profile" && <Profile />}
              {activeTab === "Logout" && <Logout />}
              {activeTab === "Receive funds" && <CreateAddressTab />}
              {activeTab === "sign up" && <AuthPage initialTab="signup" />}
              {activeTab === "History" && <History />}
              {activeTab === "Notification" && <Notifications />}
              {activeTab === "Help" && <Help />}
            </div>
          </div>
        </div>

        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

    </ProtectedRoute>
  );
}
