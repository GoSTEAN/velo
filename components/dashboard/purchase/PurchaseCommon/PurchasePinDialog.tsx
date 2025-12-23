import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PurchasePinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPinComplete: (pin: string) => void;
  isLoading: boolean;
}

export function PurchasePinDialog({
  isOpen,
  onClose,
  onPinComplete,
  isLoading,
}: PurchasePinDialogProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every((digit) => digit !== "") && index === 3) {
      onPinComplete(newPin.join(""));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border rounded-2xl p-8 max-w-md w-full mx-4"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Enter PIN</h2>

        <div className="flex justify-center gap-4 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              disabled={isLoading}
              className="w-16 h-16 text-center bg-background border-2 rounded-xl text-2xl focus:outline-none focus:border-primary"
            />
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-3 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}