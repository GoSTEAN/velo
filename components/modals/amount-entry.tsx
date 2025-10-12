"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/buttons";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { Loader2 } from "lucide-react";

interface AmountEntryProps {
  selectedToken: string;
  onAmountSubmit: (ngnAmount: string, cryptoAmount: string) => void;
  onBack: () => void;
}

export default function AmountEntry({ selectedToken, onAmountSubmit, onBack }: AmountEntryProps) {
  const [ngnAmount, setNgnAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const { rates, isLoading: ratesLoading } = useExchangeRates();

  const calculateCryptoAmount = useCallback((amount: string) => {
    if (!amount || !rates[selectedToken as keyof typeof rates]) return "";

    const ngnValue = parseFloat(amount);
    const tokenRate = rates[selectedToken as keyof typeof rates] || 1;
    
    if (tokenRate === 0) return "0";
    
    const calculated = (ngnValue / tokenRate).toFixed(6);
    return calculated;
  }, [selectedToken, rates]);

  useEffect(() => {
    if (ngnAmount && !isCalculating) {
      const calculated = calculateCryptoAmount(ngnAmount);
      setCryptoAmount(calculated);
    }
  }, [ngnAmount, calculateCryptoAmount, isCalculating]);

  const handleNgnAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setNgnAmount(value);
    }
  };

  const handleQuickSelect = (amount: string) => {
    setNgnAmount(amount);
  };

  const handleSubmit = () => {
    if (!ngnAmount || parseFloat(ngnAmount) <= 0) return;
    onAmountSubmit(ngnAmount, cryptoAmount);
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
            Amount in NGN
          </label>
          <div className="relative">
            <input
              type="text"
              value={ngnAmount}
              onChange={handleNgnAmountChange}
              placeholder="0.00"
              className="w-full p-4 text-2xl font-semibold bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <span className="text-muted-foreground font-medium">NGN</span>
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
                  ngnAmount === amount ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                ₦{parseInt(amount).toLocaleString()}
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
                ≈ ₦{parseFloat(ngnAmount).toLocaleString()}
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
          disabled={!ngnAmount || parseFloat(ngnAmount) <= 0 || parseFloat(cryptoAmount) <= 0}
          className="flex-1"
        >
          Proceed
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