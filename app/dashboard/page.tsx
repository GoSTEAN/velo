"use client";

import SideNav from "@/components/dashboard/side-nav";
import TopNav from "@/components/dashboard/top-nav";
import {
  QrCode,
  HelpCircle,
  LogOut,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import DashboardHome from "@/components/dashboard/tabs/dashboard";
import QrPayment from "@/components/dashboard/tabs/qr-payment";
import PaymentSplit from "@/components/dashboard/tabs/payment-split";
import Swap from "@/components/dashboard/tabs/swap";
import Profile from "@/components/dashboard/tabs/profile";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const sideNavTab = [
    {
      icon: <LayoutGrid size={25} />,
      name: "Dashboard",
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
    <div className="w-full  bg-background flex relative h-screen">
      <SideNav setTab={setActiveTab} activeTab={activeTab} tabs={sideNavTab} />
      <div className="flex flex-col relative w-full">
        <TopNav tabTitle={activeTab} setTab={setActiveTab} />
        <div className="w-full h-full overflow-y-scroll  relative">
          {activeTab === "Dashboard" && (
            <DashboardHome activeTab={setActiveTab} />
          )}
          {activeTab === "Qr Payment" && <QrPayment />}
          {activeTab === "Payment split" && <PaymentSplit />}
          {activeTab === "Swap" && <Swap />}
          {activeTab === "profile" && <Profile />}
          
        </div>
      </div>
    </div>
  );
}
