// /components/purchase/PurchaseSteps/ProviderSelection.tsx
import { motion } from "framer-motion";
import { ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { ProviderSelect } from "../PurchaseCommon/ProviderSelect";
import { AmountGrid } from "../PurchaseCommon/AmountGrid";
import { CustomerInput } from "../PurchaseCommon/CustomerInput";
import { DataPlanSelect } from "../PurchaseCommon/DataPlanSelect";
import { MeterTypeSelect } from "../PurchaseCommon/MeterTypeSelect";

interface ProviderSelectionProps {
  type: "airtime" | "data" | "electricity";
  formData: any;
  setFormData: (data: any) => void;
  providers: any[];
  dataPlans: any[];
  meterTypes: any[];
  presetAmounts: number[];
  verifyingMeter: boolean;
  meterVerified: boolean;
  meterVerificationMessage: string;
  config: any;
  isStep1Valid: () => boolean;
  errorMessage?: string;
  loading?: boolean;
  onNext: () => void;
  onVerifyMeter: () => void;
}

export function ProviderSelection({
  type,
  formData,
  setFormData,
  providers,
  dataPlans,
  meterTypes,
  presetAmounts,
  verifyingMeter,
  meterVerified,
  meterVerificationMessage,
  config,
  isStep1Valid,
  errorMessage,
  loading = false,
  onNext,
  onVerifyMeter,
}: ProviderSelectionProps) {
  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Get provider min/max amounts if available
  const selectedProvider = providers.find(p => p.serviceID === formData.service_id);
  const minAmount = selectedProvider?.minAmount;
  const maxAmount = selectedProvider?.maxAmount;

  if (loading && providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading providers...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:p-6"
    >
      {/* Provider Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          {config.step1Title}
        </label>
        <ProviderSelect
          providers={providers}
          value={formData.service_id}
          onChange={(serviceId) => updateFormData("service_id", serviceId)}
          loading={loading}
        />
      </div>

      {/* Amount Grid (for airtime/electricity) */}
      {config.showAmountGrid && formData.service_id && (
        <AmountGrid
          value={formData.amount}
          onChange={(amount) => updateFormData("amount", amount)}
          presetAmounts={presetAmounts}
          minAmount={minAmount}
          maxAmount={maxAmount}
        />
      )}

      {/* Data Plan Selection (for data purchases) */}
      {type === "data" && formData.service_id && (
        <DataPlanSelect
          dataPlans={dataPlans}
          value={formData.dataplan}
          onSelect={(plan) => updateFormData("dataplan", plan)}
          loading={loading}
        />
      )}

      {/* Customer Input (Phone/Meter Number) */}
      {formData.service_id && (config.showAmountGrid || type === "data") && (
        <CustomerInput
          type={type}
          value={formData.customer_id}
          onChange={(value) => updateFormData("customer_id", value)}
          config={config}
        />
      )}

      {/* Meter Type Selection (for electricity) */}
      {type === "electricity" && config.showMeterType && (
        <MeterTypeSelect
          meterTypes={meterTypes}
          value={formData.meterType}
          onChange={(type) => updateFormData("meterType", type)}
        />
      )}

      {/* Meter Verification (for electricity) */}
      {config.showVerifyButton && formData.service_id && formData.customer_id && (
        <div className="space-y-3">
          <button
            onClick={onVerifyMeter}
            disabled={verifyingMeter || meterVerified}
            className="w-full py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {verifyingMeter ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </span>
            ) : meterVerified ? (
              "✓ Meter Verified"
            ) : (
              "Verify Meter Number"
            )}
          </button>
          
          {meterVerificationMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              meterVerified 
                ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                : "bg-red-500/10 text-red-600 border border-red-500/20"
            }`}>
              {meterVerificationMessage}
            </div>
          )}
        </div>
      )}

      {/* Phone Number for Electricity (after meter verification) */}
      {type === "electricity" && formData.customer_id && meterVerified && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNo}
            onChange={(e) => updateFormData("phoneNo", e.target.value.replace(/[^\d]/g, ''))}
            placeholder="08123456789"
            className="w-full p-4 rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            maxLength={11}
          />
          <p className="text-xs text-muted-foreground">
            Enter your phone number for notifications
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            <span className="text-sm">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        disabled={!isStep1Valid() || (config.showVerifyButton && !meterVerified)}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
          isStep1Valid() && (!config.showVerifyButton || meterVerified)
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        Continue
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}