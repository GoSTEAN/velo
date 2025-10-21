"use client";

import { X } from "lucide-react";

interface PinKeypadProps {
  pin: string[];
  setPin: React.Dispatch<React.SetStateAction<string[]>>;
  headerText?: string;
  onClose?: () => void;
  onConfirm?: (pin: string) => void; 
  isLoading?: boolean;
}

export function PinKeypad({ 
  pin, 
  setPin, 
  headerText = "Enter PIN", 
  onClose, 
  onConfirm,
  isLoading = false 
}: PinKeypadProps) {
  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when PIN is complete
    if (newPin.every(digit => digit !== "") && onConfirm && !isLoading) {
      handleConfirm();
    }
  };

  const handleKeypadInput = (num: number | string): void => {
    if (isLoading) return; // Prevent input during loading
    
    if (num === "⌫") {
      const lastFilledIndex = pin.lastIndexOf(pin.find((d: string) => d !== "") ?? "");
      if (lastFilledIndex !== -1) {
        const newPin = [...pin];
        newPin[lastFilledIndex] = "";
        setPin(newPin);
        const prevInput = document.getElementById(`pin-${lastFilledIndex - 1}`);
        prevInput?.focus();
      }
    } else if (num !== "") {
      const firstEmptyIndex = pin.findIndex((d: string) => d === "");
      if (firstEmptyIndex !== -1) {
        const newPin = [...pin];
        newPin[firstEmptyIndex] = num.toString();
        setPin(newPin);
        const nextInput = document.getElementById(`pin-${firstEmptyIndex + 1}`);
        nextInput?.focus();

        // Auto-submit when PIN is complete
        if (firstEmptyIndex === 3 && onConfirm && !isLoading) {
          setTimeout(() => handleConfirm(), 100); 
        }
      }
    }
  };

  const handleConfirm = () => {
    if (pin.every(digit => digit !== "") && onConfirm && !isLoading) {
      const completePin = pin.join('');
      onConfirm(completePin);
    }
  };

  const isPinComplete = pin.every(digit => digit !== "");

  const numPad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"];

  return (
    <div className="space-y-6 relative">
      {onClose && (
        <button 
          type="button" 
          onClick={onClose} 
          className="p-2 rounded-full hover:bg-alternate/10 absolute top-0 right-0"
          disabled={isLoading}
        >
          <X size={20} />
        </button>
      )}
      <h1 className="text-2xl text-center font-semibold pt-2">{headerText}</h1>
      <div className="flex justify-between max-w-xs mx-auto gap-2 mt-10">
        {pin.map((digit, index) => (
          <input
            key={index}
            id={`pin-${index}`}
            type="password"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            className="w-15 h-15 text-center border-3 text-primary border-[#21A29D] text-2xl font-semibold rounded-2xl tracking-widest bg-transparent"
            disabled={isLoading}
          />
        ))}
      </div>

      <div className="max-w-sm mx-auto grid grid-cols-3 gap-4 mt-10">
        {numPad.map((num, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleKeypadInput(num)}
            className="w-full h-15 text-primary rounded-2xl flex items-center justify-center text-2xl font-semibold hover:bg-alternate/50 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Confirm Button */}
      <div className="max-w-sm mx-auto mt-6">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isPinComplete || isLoading}
          className="w-full h-12 bg-[#21A29D] text-white rounded-2xl flex items-center justify-center text-lg font-semibold hover:bg-[#1a8c87] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Confirming..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}