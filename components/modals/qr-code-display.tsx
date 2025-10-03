"use client";

import { CheckCheck, TriangleAlert, Copy, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface QRCodeDisplayProps {
  qrData: string;
  paymentStatus: "idle" | "pending" | "success" | "error";
  error?: string | null;
  amount: string;
  token: string;
  calculatedAmount: string;
  receiverAddress: string;
  onClose: () => void;
}

export function QRCodeDisplay({ 
  qrData, 
  paymentStatus, 
  error, 
  amount, 
  token, 
  calculatedAmount, 
  receiverAddress,
  onClose 
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(receiverAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address: ", err);
    }
  };

  if (!qrData) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border/50 rounded-xl p-6 max-w-md w-full shadow-lg">
        <div className="flex flex-col items-center gap-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">Payment Request</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Scan the QR code to pay
            </p>
          </div>

          {/* QR Code */}
          <div className="w-64 h-64 relative bg-white p-4 rounded-lg border">
            <Image 
              src={qrData} 
              alt="QR Code" 
              fill
              className="object-contain"
            />
          </div>

          {/* Payment Details */}
          <div className="w-full text-center">
            <div className="bg-accent/30 p-4 rounded-lg border">
              <p className="text-2xl font-bold text-foreground">
                {calculatedAmount} {token}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ≈ ₦{amount} NGN
              </p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Wallet Address:</span>
              <button
                onClick={handleCopyAddress}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy address"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs font-mono text-foreground break-all bg-muted/30 p-2 rounded">
              {receiverAddress}
            </p>
          </div>

          {/* Fee Info */}
          <div className="flex gap-2 justify-center items-center">
            <div className="border rounded-lg p-2 text-xs text-foreground border-primary/30">
              <span>Network Fee: </span>
              <span className="font-semibold">0.5%</span>
            </div>
          </div>

          {/* Status */}
          {paymentStatus === "pending" && (
            <div className="flex items-center gap-2 text-primary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Waiting for payment...</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCheck size={16} />
              <p className="text-sm font-medium">Payment Successful!</p>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600">
              <TriangleAlert size={16} />
              <div className="flex flex-col text-sm">
                <p className="font-medium">Payment Failed</p>
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {paymentStatus === "success" ? "Done" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}