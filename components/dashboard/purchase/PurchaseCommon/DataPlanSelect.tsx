import React from "react";
import { motion } from "framer-motion";

interface DataPlan {
  dataplanId: string;
  name: string;
  amount: string;
  validity: string;
  description?: string;
}

interface DataPlanSelectProps {
  dataPlans: DataPlan[];
  value: DataPlan | null;
  onSelect: (plan: DataPlan) => void;
  loading?: boolean;
  className?: string;
}

export function DataPlanSelect({
  dataPlans,
  value,
  onSelect,
  loading = false,
  className = "",
}: DataPlanSelectProps) {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <label className="text-sm font-medium">Select Data Plan</label>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 bg-muted animate-pulse h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  if (dataPlans.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <label className="text-sm font-medium">Select Data Plan</label>
        <div className="text-center py-8 text-muted-foreground border border-border rounded-xl">
          No data plans available for this network
        </div>
      </div>
    );
  }

  const formatAmount = (amount: string) => {
    const numAmount = parseInt(amount.replace(/[N₦,]/g, ""), 10);
    return `₦${numAmount.toLocaleString()}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="text-sm font-medium">Select Data Plan</label>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-h-96 overflow-y-auto pr-2">
        {dataPlans.map((plan) => (
          <div
            key={plan.dataplanId}
            className={`rounded-xl p-0.5 ${
              value?.dataplanId === plan.dataplanId
                ? "bg-gradient-to-r from-blue-500 to-purple-500"
                : "bg-gradient-to-r from-transparent to-transparent"
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(plan)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                value?.dataplanId === plan.dataplanId
                  ? "bg-primary/10"
                  : "bg-card hover:bg-accent border border-border"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{plan.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.validity}
                  </p>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <span className="text-lg font-bold">
                    {formatAmount(plan.amount)}
                  </span>
                </div>
              </div>
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}