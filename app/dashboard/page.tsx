"use client";

import SideNav from "@/components/dashboard/side-nav";
import TopNav from "@/components/dashboard/top-nav";
import {
  QrCode,
  HelpCircle,
  LogOut,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showNav, setShowNav] = useState(false);

  const toggleNav = () => {
    setShowNav(!showNav);
  };
  const sideNavTab = [
    {
      icon: <HugeiconsIcon icon={DashboardSquare02FreeIcons} size={25} />,
      name: "Dashboard",
    },
    {
      icon: <HugeiconsIcon icon={AddressBookIcon} size={25} />,
      name: "Create Address",
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
      <div className="w-full flex-col bg-background flex relative h-screen ">
        <TopNav tabTitle={activeTab} setTab={setActiveTab} />

        <div className="flex relative w-full  overflow-y-scroll">
          <SideNav
            setTab={setActiveTab}
            showNav={showNav}
            activeTab={activeTab}
            tabs={sideNavTab}
          />

          <div className="w-full h-full overflow-y-scroll relative">
           
            {activeTab === "Dashboard" && (
              <DashboardHome activeTab={setActiveTab} />
            )}

            {activeTab === "Qr Payment" && <QrPayment />}
            {activeTab === "Payment split" && <PaymentSplit />}
            {activeTab === "Swap" && <Swap />}
            {activeTab === "profile" && <Profile />}
            {activeTab === "Logout" && <Logout />}
            {activeTab === "Create Address" && <CreateAddressTab />}
            {activeTab === "sign up" && <AuthPage initialTab="signup" />}
            {activeTab === "History" && <History />}
            {activeTab === "Notification" && <Notifications />}
            {activeTab === "Help" && <Help />}
          </div>
        </div>

        <button
          className="fixed top-[45%] p-1 rounded-r-full bg-background cursor-pointer left-0 z-99 sm:hidden text-foreground"
          onClick={toggleNav}
        >
          {showNav ? <ChevronLeft color="red" /> : <ChevronRight />}
        </button>
      </div>
    </ProtectedRoute>
  );
}
