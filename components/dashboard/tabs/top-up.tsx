"use client";

import { useState } from "react";
// Assuming Card component is styled like the one in the screenshot (dark, slightly translucent)
import { Card } from "@/components/ui/Card"; 
import { ChevronLeft } from "lucide-react";
// Components for each step (assuming they handle their own internal styling)
import TokenSelection from "@/components/modals/token-selection";
import AmountEntry from "@/components/modals/amount-entry";
import Confirmation from "@/components/modals/confirmation";

type TopUpStep = "selection" | "amount" | "confirmation";

const steps: TopUpStep[] = ["selection", "amount", "confirmation"];
const stepTitles = {
  selection: "Select Cryptocurrency",
  amount: "Enter Amount",
  confirmation: "Confirm Purchase",
};

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
    // In a real app, you might want to show a success message here before redirecting
  };

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-6 mt-12 md:mt-16">
      <div className="space-y-6">
        {/* Adjusted Card: slightly wider for better flow, using a richer dark background */}
        <Card className="border-border/50 bg-gray-900/70 flex-col backdrop-blur-md p-8 shadow-2xl max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            {currentStep !== "selection" && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Go back to previous step"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>
            )}
            <div className="flex-1">
              {/* Stronger, more prominent title */}
              <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
                Buy Crypto
              </h1>
              {/* Current Step Title/Subtitle */}
              <p className="text-primary text-md font-semibold mt-1">
                {stepTitles[currentStep]}
              </p>
            </div>
          </div>

          {/* Progress Steps: Modern Pill/Bar Indicator */}
          <div className="flex justify-between w-full mb-10">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex flex-col items-center flex-1 min-w-0"
              >
                {/* Step Marker Pill */}
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    index <= currentStepIndex
                      ? "bg-primary" // Active/Completed
                      : "bg-muted/30" // Pending
                  }`}
                />
                {/* Step Label (Hidden on small screens, optional) */}
                <span
                  className={`hidden sm:block text-xs mt-2 transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
                    index === currentStepIndex
                      ? "text-primary font-medium"
                      : index < currentStepIndex
                      ? "text-muted-foreground/80"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {stepTitles[step]}
                </span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          {/* The min-h is kept to prevent layout shift */}
          <div className="min-h-[400px] pt-4"> 
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
    </div>
  );
}