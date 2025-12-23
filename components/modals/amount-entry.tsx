"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/buttons";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { Loader2 } from "lucide-react";

interface AmountEntryProps {
  selectedToken: string;
  onAmountSubmit: (usdAmount: string, cryptoAmount: string) => void;
  // Optional: if provided, AmountEntry will call this when the user clicks
  // Proceed and will NOT navigate to the confirmation step. Use this to
  // perform the deposit immediately from the amount screen.
  onProceed?: (usdAmount: string, cryptoAmount: string) => Promise<void> | void;
  onBack: () => void;
}

export default function AmountEntry({ selectedToken, onAmountSubmit, onProceed, onBack }: AmountEntryProps) {
  const [usdAmount, setUsdAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { rates, isLoading: ratesLoading } = useExchangeRates();

  const calculateCryptoAmount = useCallback((amount: string) => {
    if (!amount || !rates[selectedToken as keyof typeof rates] || !rates.USDT) return "";

    // Convert USD amount to NGN using USDT (approx USD peg) then compute crypto
    const usdValue = parseFloat(amount);
    const usdToNgn = rates.USDT || 1; // NGN per USD
    const ngnValue = usdValue * usdToNgn;
    const tokenRate = rates[selectedToken as keyof typeof rates] || 1;

    if (tokenRate === 0) return "0";

    const calculated = (ngnValue / tokenRate).toFixed(6);
    return calculated;
  }, [selectedToken, rates]);

  useEffect(() => {
    if (usdAmount && !isCalculating) {
      const calculated = calculateCryptoAmount(usdAmount);
      setCryptoAmount(calculated);
    }
  }, [usdAmount, calculateCryptoAmount, isCalculating]);

  const handleUsdAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setUsdAmount(value);
    }
  };

  const handleQuickSelect = (amount: string) => {
    setUsdAmount(amount);
  };

  const handleSubmit = () => {
    if (!usdAmount || parseFloat(usdAmount) <= 0) return;
    if (onProceed) {
      // If parent provided onProceed, call it to immediately create deposit
      // and do not navigate to confirmation.
      (async () => {
        setIsSubmitting(true);
        console.log("AmountEntry.onProceed payload:", { usdAmount, cryptoAmount });
        try {
          await onProceed(usdAmount, cryptoAmount);
        } catch (e) {
          console.error("onProceed handler failed:", e);
        } finally {
          setIsSubmitting(false);
        }
      })();
      return;
    }

    onAmountSubmit(usdAmount, cryptoAmount);
  };

  const quickAmounts = ["1000", "5000", "10000", "20000", "50000"];

  if (ratesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading exchange rates...</p>
      </div>
    );
  }

  const currentRate = rates[selectedToken as keyof typeof rates] || 1;

  return (
    <div className="space-y-6">
      {/* Selected Token Display */}
      <Card className="p-4 flex-col bg-accent/20 border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">You're buying</p>
            <p className="text-lg font-semibold text-foreground">{selectedToken}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Rate</p>
            <p className="text-lg font-semibold text-foreground">
              ₦{currentRate.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Amount Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount in USD
          </label>
          <div className="relative">
            <input
              type="text"
              value={usdAmount}
              onChange={handleUsdAmountChange}
              placeholder="0.00"
              className="w-full p-4 text-2xl font-semibold bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <span className="text-muted-foreground font-medium">USD</span>
            </div>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Quick select</p>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(amount)}
                className={`flex-1 min-w-0 ${
                  usdAmount === amount ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                ${parseInt(amount).toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Crypto Amount Display */}
        {cryptoAmount && (
          <Card className="p-4 flex-col bg-background border-border/50">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">You'll receive</p>
              <p className="text-2xl font-bold text-foreground">
                {parseFloat(cryptoAmount).toFixed(6)} {selectedToken}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ ₦{(parseFloat(usdAmount || "0") * (rates.USDT || 1)).toLocaleString()}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 border-border/50"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !usdAmount || parseFloat(usdAmount) <= 0 || parseFloat(cryptoAmount) <= 0}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Proceed'
          )}
        </Button>
      </div>

      {/* Fee Information */}
      <div className="bg-accent/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
           Fee Information
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Exchange Rate:</span>
            <span>1 {selectedToken} = ₦{currentRate.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Processing Fee:</span>
            <span>0.5%</span>
          </div>
          <div className="flex justify-between">
            <span>Network Fee:</span>
            <span>Included</span>
          </div>
        </div>
      </div>
    </div>
  );
}