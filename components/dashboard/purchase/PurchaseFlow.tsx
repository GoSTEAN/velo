// /components/purchase/PurchaseFlow.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

// Import hooks and sub-components
import { usePurchaseFlow } from "@/components/hooks/usePurchaseFlow";
import { usePurchaseConfig } from "@/components/hooks/usePurchaseConfig";
import { ProviderSelection } from "./PurchaseSteps/ProviderSelection";
import { PaymentSelection } from "./PurchaseSteps/PaymentSelection";
import { ReviewConfirmation } from "./PurchaseSteps/ReviewConfirmation";
import { SuccessScreen } from "./PurchaseCommon/SuccessScreen";
import { PurchasePinDialog } from "./PurchaseCommon/PurchasePinDialog";

interface PurchaseProps {
  type: "airtime" | "data" | "electricity";
}

export default function PurchaseFlow({ type }: PurchaseProps) {
  const {
    // State
    step,
    loading,
    success,
    showPinDialog,
    isSending,
    selectedToken,
    toAddress,
    errorMessage,
    verifyingMeter,
    meterVerified,
    meterVerificationMessage,
    formData,
    providers,
    dataPlans,
    electricityCompanies,
    meterTypes,
    transactionData,

    // Handlers
    setStep,
    handleBack,
    handleNext,
    handleConfirm,
    handleTokenSelect,
    setFormData,
    handleSendWithPin,
    setShowPinDialog,
    handleVerifyMeter,
    resetForm,

    // Validation
    isStep1Valid,
    validationError,

    // Utilities
    requiredCryptoAmount,
    currentWalletBalance,
  } = usePurchaseFlow({ type });

  // Use the config hook
  const {
    config,
    getPresetAmounts,
    getValidationRules,
    getRequiredFields,
    getRecommendedTokens,
    formatCustomerId,
    getTransactionDescription,
    getProgressPercentage,
  } = usePurchaseConfig(type);

  const presetAmounts = getPresetAmounts;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ProviderSelection
            type={type}
            formData={formData}
            setFormData={setFormData}
            providers={providers}
            dataPlans={dataPlans}
            meterTypes={meterTypes}
            presetAmounts={presetAmounts}
            verifyingMeter={verifyingMeter}
            meterVerified={meterVerified}
            meterVerificationMessage={meterVerificationMessage}
            config={config}
            isStep1Valid={isStep1Valid}
            errorMessage={errorMessage}
            loading={loading}
            onNext={handleNext}
            onVerifyMeter={handleVerifyMeter}
          />
        );

      case 2:
        return (
          <PaymentSelection
            type={type}
            formData={formData}
            selectedToken={selectedToken}
            providers={providers}
            config={config}
            onTokenSelect={handleTokenSelect}
            onBack={handleBack}
            onNext={handleNext}
          />
        );

      case 3:
        return (
          <ReviewConfirmation
            type={type}
            formData={formData}
            selectedToken={selectedToken}
            providers={providers}
            config={config}
            requiredCryptoAmount={requiredCryptoAmount}
            currentWalletBalance={currentWalletBalance}
            validationError={validationError}
            onBack={handleBack}
            onConfirm={handleConfirm}
          />
        );

      case 4:
        return (
          <SuccessScreen
            success={success}
            type={type}
            formData={formData}
            providers={providers}
            transactionData={transactionData}
            config={config}
            formatCustomerId={formatCustomerId}
            onReset={resetForm}
          />
        );

      default:
        return null;
    }
  };

  if (loading && step === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading purchase options...</p>
      </div>
    );
  }

  return (
    <div className="relative  p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">{config.title}</h2>
          <span className="text-sm text-muted-foreground">
            Step {step} of 4
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage(step)}%` }}
          />
        </div>
      </div>

      {/* PIN Dialog */}
      <PurchasePinDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onPinComplete={handleSendWithPin}
        isLoading={isSending}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Global Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            <span className="text-sm">{errorMessage}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
