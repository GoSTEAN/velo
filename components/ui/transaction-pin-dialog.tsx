"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PinKeypad } from "./pin-keypad";
import { useState, useEffect } from "react";

interface TransactionPinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPinComplete: (pin: string) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function TransactionPinDialog({ 
  isOpen, 
  onClose, 
  onPinComplete, 
  isLoading = false,
  title = "Authorize Transaction",
  description = "Enter your transaction PIN to confirm this transfer"
}: TransactionPinDialogProps) {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);

  // Reset pin when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        <PinKeypad
          pin={pin}
          setPin={setPin}
          headerText="Enter PIN"
          onClose={onClose}
          onConfirm={onPinComplete}
          isLoading={isLoading} // Pass isLoading to PinKeypad
        />
      </DialogContent>
    </Dialog>
  );
}