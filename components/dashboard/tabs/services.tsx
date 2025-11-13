import React, { useState } from "react";
import { PhoneCall, Wifi, Tv, Search, Zap, Lightbulb } from "lucide-react";
import Airtime from "./airtime";
import Data from "./data";
import Electricity from "./electricity";

const TABS = [
  { key: "Airtime", label: "Airtime", icon: PhoneCall },
  { key: "Data", label: "Data", icon: Wifi },
  { key: "Electricity", label: "Electricity", icon: Lightbulb },
];

export default function Services() {
  const [activeTab, setActiveTab] = useState("Airtime");
  const ActiveIcon = TABS.find((t) => t.key === activeTab)?.icon || PhoneCall;

  return (
    <div className="w-full flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl max-h-[720px]  gap-6 mt-15">
        {/* Left info / quick actions
        <aside className="md:col-span-4 p-4 bg-card/50 rounded-2xl shadow-sm flex flex-col gap-6 max-h-[640px] overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Zap className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Services</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fast, secure and simple payments — choose a service to begin.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground">
              Quick search
            </label>
            <div className="flex items-center gap-2 bg-card rounded-xl p-2">
              <Search className="text-muted-foreground" size={16} />
              <input
                className="bg-transparent outline-none text-sm w-full"
                placeholder="Search providers or plans"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Popular actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 rounded-xl bg-primary/10 text-primary text-sm">
                Buy Airtime
              </button>
              <button className="py-2 rounded-xl bg-primary/10 text-primary text-sm">
                Buy Data
              </button>
              <button className="py-2 rounded-xl bg-card text-sm">
                Top Up Wallet
              </button>
              <button className="py-2 rounded-xl bg-card text-sm">
                Browse Plans
              </button>
            </div>
          </div>

          <div className="mt-auto text-xs text-muted-foreground">
            Tip: pick a provider on the right and use the preset amounts to
            speed up purchases.
          </div>
        </aside> */}

        {/* Main content */}
        <main className="w-full p-4 bg-card  rounded-2xl relative shadow-lg max-h-[640px] overflow-y-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ActiveIcon className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{activeTab}</h2>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "Airtime"
                    ? "Quick airtime purchases"
                    : activeTab === "Data"
                    ? "Flexible data plans"
                    : "Cable subscriptions"}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Step</span>
              <div className="px-3 py-1 bg-card rounded-full text-sm font-medium">
                1 of 3
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex gap-3 flex-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-primary/10 text-primary shadow-md"
                      : "bg-card text-muted-foreground hover:bg-card/80"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card p-4 rounded-2xl">
            {activeTab === "Airtime" && <Airtime />}
            {activeTab === "Data" && <Data />}
            {activeTab === "Electricity" && <Electricity />}
          </div>
        </main>
      </div>
    </div>
  );
}
