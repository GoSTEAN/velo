"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ChevronLeft } from "lucide-react";
import TokenSelection from "@/components/modals/token-selection";
import AmountEntry from "@/components/modals/amount-entry";
import Confirmation from "@/components/modals/confirmation";

type TopUpStep = "selection" | "amount" | "confirmation";

export default function TopUp() {
  const [currentStep, setCurrentStep] = useState<TopUpStep>("selection");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amountData, setAmountData] = useState({
    ngnAmount: "",
    cryptoAmount: "",
  });

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
    setCurrentStep("amount");
  };

  const handleAmountSubmit = (ngnAmount: string, cryptoAmount: string) => {
    setAmountData({ ngnAmount, cryptoAmount });
    setCurrentStep("confirmation");
  };

  const handleBack = () => {
    if (currentStep === "amount") {
      setCurrentStep("selection");
    } else if (currentStep === "confirmation") {
      setCurrentStep("amount");
    }
  };

  const handleComplete = () => {
    // Reset flow after completion
    setCurrentStep("selection");
    setSelectedToken("");
    setAmountData({ ngnAmount: "", cryptoAmount: "" });
  };

  return (
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] flex flex-col items-center">
      <Card className="w-full max-w-md bg-card mt-10 p-6 flex flex-col gap-6 rounded-xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          {currentStep !== "selection" && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-foreground text-xl font-bold">Buy Crypto</h1>
            <p className="text-muted-foreground text-sm">
              {currentStep === "selection" && "Select cryptocurrency to buy"}
              {currentStep === "amount" && "Enter amount to buy"}
              {currentStep === "confirmation" && "Confirm your purchase"}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4">
          {["selection", "amount", "confirmation"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? "bg-primary text-primary-foreground"
                    : currentStep === "confirmation" && step === "amount"
                    ? "bg-primary text-primary-foreground"
                    : index <
                      ["selection", "amount", "confirmation"].indexOf(
                        currentStep
                      )
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    index <
                    ["selection", "amount", "confirmation"].indexOf(currentStep)
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === "selection" && (
            <TokenSelection onTokenSelect={handleTokenSelect} />
          )}
          {currentStep === "amount" && (
            <AmountEntry
              selectedToken={selectedToken}
              onAmountSubmit={handleAmountSubmit}
              onBack={handleBack}
            />
          )}
          {currentStep === "confirmation" && (
            <Confirmation
              selectedToken={selectedToken}
              ngnAmount={amountData.ngnAmount}
              cryptoAmount={amountData.cryptoAmount}
              onComplete={handleComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
