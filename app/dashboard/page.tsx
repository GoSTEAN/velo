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
import Image from "next/image";
import DashboardHome from "@/components/dashboard/tabs/dashboard";
import QrPayment from "@/components/dashboard/tabs/qr-payment";
import PaymentSplit from "@/components/dashboard/tabs/payment-split";
import Swap from "@/components/dashboard/tabs/swap";
import Profile from "@/components/dashboard/tabs/profile";
import AuthPage from "@/components/auth/AuthPage";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showNav, setShowNav] = useState(false);

  const toggleNav = () => {
    setShowNav(!showNav);
  };
  const sideNavTab = [
    {
      icon: <LayoutGrid size={25} />,
      name: "Dashboard",
    },
    {
      icon: <LayoutGrid size={25} />,
      name: "Create Address",
    },
    {
      icon: <QrCode size={25} />,
      name: "Qr Payment",
    },
    {
      icon: (
        <Image
          src="/user-group.svg"
          alt="history ison"
          width={24}
          height={24}
        />
      ),

      name: "Payment split",
    },
    {
      icon: (
        <Image
          src="/exchange-02.svg"
          alt="history ison"
          width={24}
          height={24}
        />
      ),

      name: "Swap",
    },
    {
      icon: (
        <Image
          src="/transaction-history.svg"
          alt="history ison"
          width={24}
          height={24}
        />
      ),
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
    <div className="w-full flex-col bg-background flex relative h-screen overflow-y-scroll">
      <TopNav tabTitle={activeTab} setTab={setActiveTab} />

      <div className="flex relative w-full">
        <SideNav
          setTab={setActiveTab}
          showNav={showNav}
          activeTab={activeTab}
          tabs={sideNavTab}
        />

        <div className="w-full h-full overflow-y-scroll  relative">
          {activeTab === "Dashboard" && (
            <DashboardHome activeTab={setActiveTab} />
          )}
          {activeTab === "Qr Payment" && <QrPayment />}
          {activeTab === "Payment split" && <PaymentSplit />}
          {activeTab === "Swap" && <Swap />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "sign up" && <AuthPage initialTab="signup" />}
        </div>
       </div>

      <button
        className="fixed top-[45%] p-1 rounded-r-full bg-background cursor-pointer left-0 z-99 sm:hidden text-foreground"
        onClick={toggleNav}
      >
        {showNav ? <ChevronLeft color="red" /> : <ChevronRight />}
      </button>
    </div>
  );
}
