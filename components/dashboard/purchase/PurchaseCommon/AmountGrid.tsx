import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface AmountGridProps {
  value: string;
  onChange: (amount: string) => void;
  presetAmounts: number[];
  minAmount?: number;
  maxAmount?: number;
  className?: string;
}

export function AmountGrid({
  value,
  onChange,
  presetAmounts,
  minAmount,
  maxAmount,
  className = "",
}: AmountGridProps) {
  const numericValue = parseFloat(value) || 0;

  const isBelowMin =
    minAmount !== undefined && numericValue > 0 && numericValue < minAmount;
  const isAboveMax = maxAmount !== undefined && numericValue > maxAmount;

  const filteredPresets = presetAmounts.filter((amount) => {
    if (minAmount !== undefined && amount < minAmount) return false;
    if (maxAmount !== undefined && amount > maxAmount) return false;
    return true;
  });

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Amount (₦)</label>
        {(minAmount || maxAmount) && (
          <span className="text-xs text-muted-foreground">
            {minAmount && `Min: ₦${minAmount.toLocaleString()}`}
            {minAmount && maxAmount && " • "}
            {maxAmount && `Max: ₦${maxAmount.toLocaleString()}`}
          </span>
        )}
      </div>

      {filteredPresets.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {filteredPresets.map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(amount.toString())}
              className={`p-2 sm:p-3 rounded-lg text-sm sm:text-md transition-all border ${
                value === amount.toString()
                  ? " bg-primary/10 text-primary font-semibold"
                  : " hover:border-primary/50 hover:bg-accent"
              }`}
            >
              ₦{amount.toLocaleString()}
            </motion.button>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleCustomAmountChange}
          placeholder="Enter custom amount"
          className={`w-full sm:p-4 py-2 px-3 text-sm sm:text-md rounded-lg border-2 pr-10 transition-colors ${
            isBelowMin || isAboveMax
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : " focus:border-primary focus:ring-primary/20"
          } outline-none focus:ring-2`}
        />
        {(isBelowMin || isAboveMax) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle size={18} className="text-red-500" />
          </div>
        )}
      </div>

      {(isBelowMin || isAboveMax) && (
        <p className="text-sm text-red-600 mt-2">
          {isBelowMin
            ? `Amount must be at least ₦${minAmount?.toLocaleString()}`
            : `Amount cannot exceed ₦${maxAmount?.toLocaleString()}`}
        </p>
      )}
    </div>
  );
}