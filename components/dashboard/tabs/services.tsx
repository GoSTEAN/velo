import React, { useState } from "react";
import Airtime from "./airtime";
import Data from "./data";
import TV from "./tv";

export default function Services() {
  const [activeTab, setActiveTab] = useState("Airtime");
  return (
    <div className="w-full min-h-full p-5 space-y-6">
      <div className="w-full max-w-lg mx-auto flex items-center gap-4">
        {["Airtime", "Data", "TV"].map((service, id) => (
          <button
            onClick={() => setActiveTab(service)}
            key={id}
            className={` w-full rounded-full py-3 px-6 bg-card border transition-all duration-300 ${
              activeTab === service ? "border-purple-500" : ""
            }`}
          >
            {service}
          </button>
        ))}
      </div>

      <div className="w-full h-auto p-3 lg:p-5 bg-card rounded-3xl">
        {activeTab === "Airtime" && <Airtime />}
        {activeTab === "Data" && <Data />}
        {activeTab === "TV" && <TV />}
      </div>
    </div>
  );
}
