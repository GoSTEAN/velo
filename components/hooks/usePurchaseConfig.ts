import { useCallback, useMemo } from "react";
import { PhoneCall, Wifi, Zap } from "lucide-react";

export interface PurchaseConfig {
  title: string;
  icon: any; // React component
  step1Title: string;
  step1Description: string;
  customerLabel: string;
  placeholder: string;
  showAmountGrid: boolean;
  showVariations: boolean;
  showMeterType: boolean;
  showVerifyButton: boolean;
  receiptFields: string[];
}

export function usePurchaseConfig(type: "airtime" | "data" | "electricity") {
  const config = useMemo((): PurchaseConfig => {
    const baseConfigs = {
      airtime: {
        title: "Buy Airtime",
        icon: PhoneCall,
        step1Title: "Select network",
        step1Description: "Choose your network provider",
        customerLabel: "Phone Number",
        placeholder: "8012345678",
        showAmountGrid: true,
        showVariations: false,
        showMeterType: false,
        showVerifyButton: false,
        receiptFields: ["Network", "Phone Number", "Amount", "Transaction ID"],
      },
      data: {
        title: "Purchase Data",
        icon: Wifi,
        step1Title: "Select network",
        step1Description: "Choose your network provider",
        customerLabel: "Phone Number",
        placeholder: "8012345678",
        showAmountGrid: false,
        showVariations: true,
        showMeterType: false,
        showVerifyButton: false,
        receiptFields: ["Network", "Phone Number", "Data Plan", "Transaction ID"],
      },
      electricity: {
        title: "Electricity Bill",
        icon: Zap,
        step1Title: "Select provider",
        step1Description: "Choose your electricity provider",
        customerLabel: "Meter Number",
        placeholder: "Enter meter number",
        showAmountGrid: true,
        showVariations: false,
        showMeterType: true,
        showVerifyButton: true,
        receiptFields: ["Provider", "Meter Number", "Amount", "Token", "Transaction ID"],
      },
    };

    return baseConfigs[type];
  }, [type]);

  // Helper function to get preset amounts based on type
  const getPresetAmounts = useMemo(() => {
    const typePresets = {
      airtime: [100, 200, 500, 1000, 2000, 5000],
      data: [100, 200, 500, 1000, 2000, 5000], // Not used for data, but available
      electricity: [1000, 2000, 5000, 10000, 20000, 50000],
    };
    return typePresets[type];
  }, [type]);

  // Get validation rules for customer input
  const getValidationRules = useMemo(() => {
    const rules = {
      airtime: {
        pattern: /^[0-9]{10}$/,
        errorMessage: "Please enter a valid 10-digit phone number",
      },
      data: {
        pattern: /^[0-9]{10}$/,
        errorMessage: "Please enter a valid 10-digit phone number",
      },
      electricity: {
        pattern: /^[0-9]{6,20}$/,
        errorMessage: "Please enter a valid meter number",
      },
    };
    return rules[type];
  }, [type]);

  // Get required fields for step 1
  const getRequiredFields = useMemo(() => {
    const required = {
      airtime: ["service_id", "amount", "customer_id"],
      data: ["service_id", "dataplan", "customer_id"],
      electricity: ["service_id", "amount", "customer_id", "meterType"],
    };
    return required[type];
  }, [type]);

  // Get crypto token recommendations based on type
  const getRecommendedTokens = useMemo(() => {
    const recommendations = {
      airtime: ["ethereum", "bitcoin", "usdt-erc20"],
      data: ["ethereum", "solana", "usdt-erc20"],
      electricity: ["ethereum", "starknet", "usdt-erc20"],
    };
    return recommendations[type];
  }, [type]);

  // Format customer ID for display
  const formatCustomerId = useCallback((customerId: string): string => {
    if (type === "electricity") {
      return customerId;
    }
    // Add +234 prefix for phone numbers
    return `+234 ${customerId.slice(0, 3)} ${customerId.slice(3, 6)} ${customerId.slice(6)}`;
  }, [type]);

  // Get transaction description
  const getTransactionDescription = useCallback(
    (providerName: string, amount: string, customerId: string): string => {
      const formattedCustomerId = formatCustomerId(customerId);
      
      const descriptions = {
        airtime: `${providerName} airtime recharge of ₦${amount} for ${formattedCustomerId}`,
        data: `${providerName} data purchase for ${formattedCustomerId}`,
        electricity: `${providerName} electricity bill payment of ₦${amount} for meter ${formattedCustomerId}`,
      };
      
      return descriptions[type];
    },
    [type, formatCustomerId]
  );

  // Get provider image path
  const getProviderImagePath = useCallback((providerCode: string): string => {
    const basePath = "/img/providers";
    const images = {
      airtime: `${basePath}/telco/${providerCode.toLowerCase()}.png`,
      data: `${basePath}/telco/${providerCode.toLowerCase()}.png`,
      electricity: `${basePath}/power/${providerCode.toLowerCase()}.png`,
    };
    return images[type];
  }, [type]);

  // Check if amount is within provider limits
  const isAmountValid = useCallback(
    (amount: number, provider?: { minAmount?: number; maxAmount?: number }): {
      valid: boolean;
      error?: string;
    } => {
      if (!amount || amount <= 0) {
        return { valid: false, error: "Amount must be greater than 0" };
      }

      if (provider?.minAmount && amount < provider.minAmount) {
        return {
          valid: false,
          error: `Minimum amount is ₦${provider.minAmount.toLocaleString()}`,
        };
      }

      if (provider?.maxAmount && amount > provider.maxAmount) {
        return {
          valid: false,
          error: `Maximum amount is ₦${provider.maxAmount.toLocaleString()}`,
        };
      }

      return { valid: true };
    },
    []
  );

  // Get step titles for the entire flow
  const getStepTitles = useMemo(() => {
    const steps = {
      1: config.step1Title,
      2: "Select Payment Method",
      3: "Review & Confirm",
      4: "Transaction Result",
    };
    return steps;
  }, [config.step1Title]);

  // Get progress percentage
  const getProgressPercentage = useCallback((step: number): number => {
    const percentages: Record<number, number> = {
      1: 25,
      2: 50,
      3: 75,
      4: 100,
    };
    return percentages[step] || 0;
  }, []);

  return {
    config,
    getPresetAmounts,
    getValidationRules,
    getRequiredFields,
    getRecommendedTokens,
    formatCustomerId,
    getTransactionDescription,
    getProviderImagePath,
    isAmountValid,
    getStepTitles,
    getProgressPercentage,
  };
}