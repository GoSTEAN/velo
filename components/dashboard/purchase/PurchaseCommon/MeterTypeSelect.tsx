import React from "react";
import { motion } from "framer-motion";

interface MeterType {
  value: "prepaid" | "postpaid";
  label: string;
}

interface MeterTypeSelectProps {
  meterTypes: MeterType[];
  value: "prepaid" | "postpaid";
  onChange: (type: "prepaid" | "postpaid") => void;
  className?: string;
}

export function MeterTypeSelect({
  meterTypes,
  value,
  onChange,
  className = "",
}: MeterTypeSelectProps) {
  if (meterTypes.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="text-sm font-medium">Meter Type</label>
      <div className="grid grid-cols-2 gap-3">
        {meterTypes.map((type) => (
          <motion.button
            key={type.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(type.value)}
            className={`p-4 rounded-xl transition-all border ${
              value === type.value
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border hover:border-primary/50 hover:bg-accent"
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">{type.label}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}