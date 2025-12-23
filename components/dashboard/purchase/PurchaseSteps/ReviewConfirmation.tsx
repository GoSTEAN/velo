// /components/purchase/PurchaseSteps/ReviewConfirmation.tsx
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, AlertCircle } from "lucide-react";

interface ReviewConfirmationProps {
  type: string;
  formData: any;
  selectedToken: string;
  providers: any[];
  config: any;
  requiredCryptoAmount: number;
  currentWalletBalance: number;
  validationError: string | null;
  onBack: () => void;
  onConfirm: () => void;
}

export function ReviewConfirmation({
    type,
  formData,
  selectedToken,
  providers,
  config,
  requiredCryptoAmount,
  currentWalletBalance,
  validationError,
  onBack,
  onConfirm,
}: ReviewConfirmationProps) {
  const hasInsufficientBalance = requiredCryptoAmount > currentWalletBalance;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 sm:p-6"
    >
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-accent transition-colors mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="sm:text-xl text-lg font-semibold">Transaction Summary</h2>
      </div>

      <div className="bg-card border rounded-2xl p-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground font-[UbuntuSans] sm:text-md text-sm font-semibold">Product</span>
          <span className= "capitalize font-medium text-sm font-[UbuntuSans] sm:text-md">{type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-[UbuntuSans] sm:text-md text-sm font-semibold">Provider</span>
          <span  className="font-medium text-sm font-[UbuntuSans] sm:text-md">
            {providers.find(p => p.serviceID === formData.service_id)?.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-[UbuntuSans] sm:text-md text-sm font-semibold">{config.customerLabel}</span>
          <span  className="font-medium text-sm font-[UbuntuSans] sm:text-md">
            {type !== "electricity" ? `234${formData.customer_id}` : formData.customer_id}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-[UbuntuSans] sm:text-md text-sm font-semibold">Payment Method</span>
          <span  className="font-medium text-sm font-[UbuntuSans] sm:text-md capitalize">{selectedToken}</span>
        </div>
        <div className="flex justify-between pt-4 border-t">
          <span className="text-muted-foreground font-[UbuntuSans] sm:text-md text-sm font-semibold">Total Amount</span>
          <span className="text-2xl font-bold">
            ₦{parseInt(formData.amount || "0").toLocaleString()}
          </span>
        </div>
        
        {/* Crypto Amount */}
        <div className="pt-4 border-t w-full">
          <div className="flex justify-between w-full  mb-2">
            <span className="text-muted-foreground font-[UbuntuSans] w-full sm:text-md text-sm font-semibold">Required Crypto</span>
            <span  className="font-medium text-sm w-full font-[UbuntuSans] text-end sm:text-md">
              {requiredCryptoAmount.toFixed(6)} {selectedToken.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between w-full">
            <span className="text-muted-foreground font-[UbuntuSans] sm:text-md w-full text-sm font-semibold">Your Balance</span>
            <span  className={`font-medium text-sm w-full text-end font-[UbuntuSans] sm:text-md ${
              hasInsufficientBalance ? "text-red-600" : "text-green-600"
            }`}>
              {currentWalletBalance.toFixed(6)} {selectedToken.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {hasInsufficientBalance && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            <span className="text-sm">Insufficient balance for this transaction</span>
          </div>
        </div>
      )}

      {validationError && !hasInsufficientBalance && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle size={16} />
            <span className="text-sm">{validationError}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 p-4 rounded-xl border hover:bg-accent transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!!validationError || hasInsufficientBalance}
          className={`flex-1 p-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
            validationError || hasInsufficientBalance
              ? "bg-muted text-muted-foreground font-[UbuntuSans] sm:text-md text-sm font-semibold cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          Confirm & Pay
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}