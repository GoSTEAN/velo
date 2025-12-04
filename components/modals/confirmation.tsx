"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/buttons";
import { Check, Copy, Loader2 } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { apiClient } from "@/lib/api-client";

interface ConfirmationProps {
  selectedToken: string;
  ngnAmount: string;
  cryptoAmount: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function Confirmation({
  selectedToken,
  ngnAmount,
  cryptoAmount,
  onComplete,
  onBack
}: ConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const processingFee = parseFloat(ngnAmount) * 0.005;
  const totalAmount = parseFloat(ngnAmount) + processingFee;

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);

    try {
      // Determine wallet address to send back to backend. Prefer session-stored addresses
      let walletAddress: string | undefined = undefined;
      try {
        const raw = sessionStorage.getItem("velo.wallet.addresses");
        if (raw) {
          const arr = JSON.parse(raw) as Array<any>;
          if (Array.isArray(arr) && arr.length > 0) {
            walletAddress = arr[0].address || arr[0]?.address;
          }
        }
      } catch (e) {
        // ignore
      }

      const resp = await apiClient.createFiatDeposit({
        currencyTo: selectedToken,
        amountFrom: ngnAmount,
        walletAddress,
      });

      if (resp && resp.redirectUrl) {
        // If backend returned a redirectUrl (Moonpay or similar), follow it.
        // Use assign so the current page can be tracked in history; open in new tab if preferred.
        window.location.assign(resp.redirectUrl);
        return;
      }

      // If backend did not return a redirect, treat as success and show success UI
      setIsSuccess(true);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyReference = () => {
    const reference = `VELO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Purchase Successful!
          </h2>
          <p className="text-muted-foreground">
            Your {selectedToken} will be delivered to your wallet shortly.
          </p>
        </div>

        <Card className="p-4 bg-accent/20 border-border/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{cryptoAmount} {selectedToken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  VELO-{Date.now().toString().slice(-8)}
                </span>
                <button
                  onClick={handleCopyReference}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Button onClick={onComplete} className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card className="p-6 bg-card flex-col border-border/50">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Order Summary
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Cryptocurrency:</span>
            <span className="font-medium">{selectedToken}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{cryptoAmount} {selectedToken}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">NGN Amount:</span>
            <span className="font-medium">₦{parseFloat(ngnAmount).toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Processing Fee (0.5%):</span>
            <span className="font-medium">₦{processingFee.toLocaleString()}</span>
          </div>
          
          <div className="border-t border-border pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="font-bold text-lg">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-4 bg-accent/20 flex-col  border-border/50">
        <h3 className="font-medium text-foreground mb-3">Payment Method</h3>
        <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
          <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">₦</span>
          </div>
          <div>
            <p className="font-medium text-sm">Naira Bank Transfer</p>
            <p className="text-xs text-muted-foreground">
              Transfer to VELO dedicated account
            </p>
          </div>
        </div>
      </Card>

      {/* Bank Details */}
      <Card className="p-4 flex-col bg-accent/20 border-border/50">
        <h3 className="font-medium text-foreground mb-3">Transfer Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bank:</span>
            <span className="font-medium">Velo Bank</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Number:</span>
            <span className="font-medium">1234567890</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Name:</span>
            <span className="font-medium">VELO TECHNOLOGIES LTD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference:</span>
            <span className="font-mono">VELO-{user?.id.slice(-8)}</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          📝 Important Instructions
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Transfer exactly ₦{totalAmount.toLocaleString()}</li>
          <li>• Use the reference number provided</li>
          <li>• Payment will be processed within 15 minutes</li>
          <li>• Contact support if you encounter any issues</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 border-border/50"
        >
          Back
        </Button>
        <Button
          onClick={handleConfirmPurchase}
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Confirm Purchase'
          )}
        </Button>
      </div>
    </div>
  );
}