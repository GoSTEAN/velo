"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards";
import { Button } from "@/components/ui/buttons";
import { Shield, Lock, CheckCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePin } from "@/components/hooks/usePin";
import { PinKeypad } from "../ui/pin-keypad";

interface SetTransactionPinProps {
  hasTransactionPin?: boolean;
}

export function SetTransactionPin({ hasTransactionPin = false }: SetTransactionPinProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"set" | "confirm">("set");
  const [pin, setPin] = useState<string[]>(Array(4).fill(""));
  const [confirmPin, setConfirmPin] = useState<string[]>(Array(4).fill(""));
  
  const { pinState, setPin: setTransactionPin } = usePin();

  const resetState = () => {
    setPin(Array(4).fill(""));
    setConfirmPin(Array(4).fill(""));
    setCurrentStep("set");
  };

  const handleSetPin = async () => {
    const enteredPin = pin.join("");
    
    if (enteredPin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    setCurrentStep("confirm");
    setConfirmPin(Array(4).fill(""));
  };

  const handleConfirmPin = async () => {
    const enteredPin = pin.join("");
    const confirmedPin = confirmPin.join("");
    
    if (enteredPin.length !== 4 || confirmedPin.length !== 4) {
      toast.error("Please complete both PIN fields");
      return;
    }

    if (enteredPin !== confirmedPin) {
      toast.error("PINs do not match. Please try again.");
      setConfirmPin(Array(4).fill(""));
      return;
    }

    try {
      // Use the actual API to set the PIN
      const result = await setTransactionPin(enteredPin);
      
      if (result.success) {
        toast.success("Transaction PIN set successfully!");
        setIsDialogOpen(false);
        resetState();
        
        // Refresh PIN status
        // await checkPinStatus();
      } else {
        toast.error(`Failed to set PIN: ${result.message}`);
      }
    } catch (error: any) {
      toast.error(`Failed to set PIN: ${error.message || "Please try again"}`);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTimeout(resetState, 300); // Reset after dialog closes
  };

  const isPinComplete = pin.every(digit => digit !== "");
  const isConfirmPinComplete = confirmPin.every(digit => digit !== "");

  return (
    <Card className="transition-smooth hover:shadow-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pb-6">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg sm:text-xl">Transaction PIN</CardTitle>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent w-full sm:w-auto"
              disabled={pinState.isSetting}
            >
              <Shield className="w-4 h-4" />
              {hasTransactionPin ? "Change PIN" : "Set PIN"}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto bg-sidebar backdrop-blur-lg border border-border/50 shadow-lg">
            <DialogHeader>
              <DialogTitle>
                {currentStep === "set" ? "Set Transaction PIN" : "Confirm Transaction PIN"}
              </DialogTitle>
            </DialogHeader>
            
            <AnimatePresence mode="wait">
              {currentStep === "set" ? (
                <motion.div
                  key="set-pin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <PinKeypad
                    pin={pin}
                    setPin={setPin}
                    headerText="Enter 4-digit PIN"
                    onClose={() => setIsDialogOpen(false)}
                  />
                  
                  <div className="mt-6 space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Create a 4-digit PIN to secure your transactions
                    </p>
                    
                    <Button
                      onClick={handleSetPin}
                      disabled={!isPinComplete || pinState.isSetting}
                      className="w-full gap-2"
                    >
                      {pinState.isSetting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Continue
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="confirm-pin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <PinKeypad
                    pin={confirmPin}
                    setPin={setConfirmPin}
                    headerText="Confirm PIN"
                    onClose={() => setCurrentStep("set")}
                  />
                  
                  <div className="mt-6 space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Please confirm your 4-digit transaction PIN
                    </p>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep("set")}
                        disabled={pinState.isSetting}
                        className="flex-1 gap-2 bg-transparent"
                      >
                        <X className="w-4 h-4" />
                        Back
                      </Button>
                      <Button
                        onClick={handleConfirmPin}
                        disabled={!isConfirmPinComplete || pinState.isSetting}
                        className="flex-1 gap-2"
                      >
                        {pinState.isSetting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Confirm
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {pinState.isSet || hasTransactionPin ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Transaction PIN Set
              </h3>
              <p className="text-sm text-muted-foreground">
                Your transaction PIN is active and securing your account
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 mx-auto mb-4">
                <Shield className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Transaction PIN Set
              </h3>
              <p className="text-sm text-muted-foreground">
                Set a transaction PIN to secure your financial transactions
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {pinState.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-sm text-destructive text-center">
              {pinState.error}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}