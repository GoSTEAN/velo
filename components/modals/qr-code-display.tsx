"use client";

import { Check, Copy, TriangleAlert, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useMerchantPayments } from "../hooks";

interface QRCodeDisplayProps {
  qrData: string;
  paymentStatus: string;
  error?: string | null;
  amount: string;
  token: string;
  calculatedAmount: string;
  receiverAddress: string;
  onClose: () => void;
  paymentId: string;
}

export function QRCodeDisplay({
  qrData,
  paymentStatus: initialPaymentStatus,
  amount,
  token,
  calculatedAmount,
  receiverAddress,
  onClose,
  paymentId,
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [currentPaymentStatus, setCurrentPaymentStatus] =
    useState(initialPaymentStatus);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Use the merchant hook instead of AuthContext
  const { getPaymentStatus } = useMerchantPayments();

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(receiverAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address: ", err);
    }
  };

  const fetchPaymentStatus = async () => {
    if (!paymentId) return;

    try {
      // console.log(" Fetching payment status for:", paymentId);
      const response = await getPaymentStatus(paymentId);
      // Log the raw response for debugging (helps diagnose chain-specific differences)
      console.log("Merchant payment monitor response:", response);

      if (response && response.payment) {
        const payment = response.payment as any;
        const rawStatus = (payment.status || "").toString().toLowerCase();

        // Normalize behavior:
        // Some backends may mark a payment as "completed" before a transaction proof
        // (txHash or paidAt) is present for chains like Solana. Only treat as completed
        // when a proof exists; otherwise keep it as pending so the UI shows the spinner.
        let normalizedStatus = rawStatus;

        const hasProof = !!(
          payment.txHash ||
          payment.paidAt ||
          payment.txhash ||
          payment.transactionHash
        );

        if (
          (rawStatus === "completed" ||
            rawStatus === "paid" ||
            rawStatus === "confirmed") &&
          !hasProof
        ) {
          console.warn(
            "Payment status marked completed by backend but no proof present - treating as pending",
            payment
          );
          normalizedStatus = "pending";
        }

        setCurrentPaymentStatus(normalizedStatus);
        setStatusError(null);

        // Auto-close if payment is completed and has proof
        if (normalizedStatus === "completed" && hasProof) {
          // Wait a moment so user can see the success state
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error(" Error fetching payment status:", err);
      setStatusError(err.message || "Failed to fetch payment status");
    }
  };

  useEffect(() => {
    if (!paymentId) return;

    // Fetch status immediately when component mounts
    fetchPaymentStatus();

    const intervalId = setInterval(() => {
      fetchPaymentStatus();
    }, 5000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [paymentId]);

  if (!qrData) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border/50 rounded-xl p-6 max-w-md w-full shadow-lg relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">
              Payment Request
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Scan the QR code to pay
            </p>
          </div>

          {/* QR Code */}
          <div className="w-64 h-64 relative bg-white p-4 rounded-lg border">
            <Image src={qrData} alt="QR Code" fill className="object-contain" />
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

          {/* Payment ID */}
          {paymentId && (
            <div className="w-full">
              <p className="text-xs text-muted-foreground text-center">
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>
            </div>
          )}

          {/* Status Display */}
          <div className="w-full text-center">
            <div
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                currentPaymentStatus === "pending"
                  ? "bg-yellow-500/10 text-yellow-600"
                  : currentPaymentStatus === "completed"
                  ? "bg-green-500/10 text-green-600"
                  : currentPaymentStatus === "failed" ||
                    currentPaymentStatus === "cancelled"
                  ? "bg-red-500/10 text-red-600"
                  : "bg-gray-500/10 text-gray-600"
              }`}
            >
              {currentPaymentStatus === "pending" && (
                <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              {currentPaymentStatus === "completed" && <Check size={16} />}
              {(currentPaymentStatus === "failed" ||
                currentPaymentStatus === "cancelled") && <X size={16} />}
              <span className="text-sm font-medium capitalize">
                {currentPaymentStatus || "unknown"}
              </span>
            </div>

            {/* Success message for completed payments */}
            {currentPaymentStatus === "completed" && (
              <p className="text-xs text-green-600 mt-2">
                Payment completed! Closing automatically...
              </p>
            )}
          </div>

          {/* Wallet Address */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Wallet Address:
              </span>
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

          {/* Error Display */}
          {statusError && (
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 text-red-600 bg-red-500/10 p-2 rounded">
                <TriangleAlert size={14} />
                <p className="text-xs">{statusError}</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full p-3 bg-muted/50 text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
          >
            {currentPaymentStatus === "completed" ? "Done" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
