import React from "react";
import { motion } from "framer-motion";
import { Check, X, Home, Download, Copy } from "lucide-react";
import { PurchaseConfig } from "@/components/hooks/usePurchaseConfig";

interface SuccessScreenProps {
  success: boolean | null;
  type: "airtime" | "data" | "electricity";
  formData: any;
  providers: any[];
  transactionData: any;
  config: PurchaseConfig;
  formatCustomerId: (id: string) => string;
  onReset: () => void;
  className?: string;
}

export function SuccessScreen({
  success,
  type,
  formData,
  providers,
  transactionData,
  config,
  formatCustomerId,
  onReset,
  className = "",
}: SuccessScreenProps) {
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    // Implement receipt download logic
    console.log("Download receipt");
  };

  if (success === null) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">Processing transaction...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`space-y-6 p-6 text-center ${className}`}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="flex justify-center mb-6"
      >
        {success ? (
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Check className="w-16 h-16 text-white" />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
            <X className="w-16 h-16 text-white" />
          </div>
        )}
      </motion.div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {success ? "Transaction Successful!" : "Transaction Failed"}
        </h2>
        <p className="text-muted-foreground">
          {success
            ? "Your transaction has been processed successfully"
            : "Something went wrong. Please try again."}
        </p>
      </div>

      {/* Transaction Details */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-2xl p-6 space-y-4 text-left"
        >
          <h3 className="font-semibold mb-4">Transaction Details</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                ₦{parseInt(formData.amount || "0").toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">
                {
                  providers.find((p) => p.serviceID === formData.service_id)
                    ?.name
                }
              </span>
            </div>

            {formData.customer_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {type === "electricity" ? "Meter Number" : "Phone Number"}
                </span>
                <span className="font-medium font-mono">
                  {type === "electricity"
                    ? formData.customer_id
                    : `234${formData.customer_id}`}
                </span>
              </div>
            )}

            {transactionData?.purchaseId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium font-mono text-sm">
                    {transactionData.purchaseId.slice(0, 8)}...
                  </span>
                  <button
                    onClick={() => handleCopy(transactionData.purchaseId)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy transaction ID"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}

            {transactionData?.meterToken && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-muted-foreground">Meter Token</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use this token to recharge your meter
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono bg-muted px-2 py-1 rounded text-sm">
                      {transactionData.meterToken.slice(0, 12)}...
                    </code>
                    <button
                      onClick={() => handleCopy(transactionData.meterToken)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy token"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Download Receipt Button */}
          <div className="pt-4 border-t">
            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download Receipt
            </button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="w-full py-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Home size={20} />
          {success ? "New Purchase" : "Try Again"}
        </motion.button>

        {success && (
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full py-3 rounded-xl border hover:bg-accent transition-colors"
          >
            Back to Dashboard
          </button>
        )}
      </div>

      {/* Confetti Effect (Success only) */}
      {success && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: "50%", y: "50%", scale: 0, opacity: 1 }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, delay: i * 0.02, ease: "easeOut" }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: [
                  "#ef4444", // red-500
                  "#f59e0b", // amber-500
                  "#10b981", // emerald-500
                  "#3b82f6", // blue-500
                  "#8b5cf6", // violet-500
                  "#ec4899", // pink-500
                ][i % 6],
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
