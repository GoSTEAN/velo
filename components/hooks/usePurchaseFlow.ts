// /components/purchase/hooks/usePurchaseFlow.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { useWalletData } from "@/components/hooks";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { normalizeStarknetAddress } from "@/components/lib/utils";
import { apiClient } from "@/lib/api-client";
import { validatePhoneNumber } from "@/lib/utils";
import { toast } from "sonner";

export interface PurchaseFormData {
  service_id: string;
  amount: string;
  customer_id: string;
  meterType: "prepaid" | "postpaid";
  dataplan: any | null;
  expectedAmount: any | null;
  transactionData: any | null;
  phoneNo: string;
}

interface Provider {
  serviceID: string;
  name: string;
  image: string;
  code?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface ExpectedAmount {
  cryptoAmount: number;
  cryptoCurrency: string;
  chain: string;
}

const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

const getConfig = (type: "airtime" | "data" | "electricity") => {
  const config = {
    airtime: {
      title: "Buy Airtime",
      step1Title: "Select network",
      step1Description: "Choose your network provider",
      customerLabel: "Phone Number",
      placeholder: "8012345678",
      showAmountGrid: true,
      showVariations: false,
      showMeterType: false,
      showVerifyButton: false,
    },
    data: {
      title: "Purchase Data",
      step1Title: "Select network",
      step1Description: "Choose your network provider",
      customerLabel: "Phone Number",
      placeholder: "8012345678",
      showAmountGrid: false,
      showVariations: true,
      showMeterType: false,
      showVerifyButton: false,
    },
    electricity: {
      title: "Electricity Bill",
      step1Title: "Select provider",
      step1Description: "Choose your electricity provider",
      customerLabel: "Meter Number",
      placeholder: "Enter meter number",
      showAmountGrid: true,
      showVariations: false,
      showMeterType: true,
      showVerifyButton: true,
    },
  };
  return config[type];
};

export function usePurchaseFlow({ type }: { type: "airtime" | "data" | "electricity" }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedToken, setSelectedToken] = useState("ethereum");
  const [toAddress, setToAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [merchantFallback, setMerchantFallback] = useState(false);
  const [verifyingMeter, setVerifyingMeter] = useState(false);
  const [meterVerified, setMeterVerified] = useState(false);
  const [meterVerificationMessage, setMeterVerificationMessage] = useState("");
  const [transactionData, setTransactionData] = useState<any>(null);

  const [formData, setFormData] = useState<PurchaseFormData>({
    service_id: "",
    amount: "",
    customer_id: "",
    meterType: "prepaid",
    dataplan: null,
    expectedAmount: null,
    transactionData: null,
    phoneNo: "",
  });

  const [providers, setProviders] = useState<Provider[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [electricityCompanies, setElectricityCompanies] = useState<any[]>([]);
  const [meterTypes, setMeterTypes] = useState<any[]>([]);

  const { sendTransaction } = useAuth();
  const { rates } = useExchangeRates();
  const { addresses, balances } = useWalletData();

  const config = useMemo(() => getConfig(type), [type]);

  // Get merchant wallet address for selected token
  const getToAddress = useCallback((chain: string) => {
    if (typeof window !== "undefined") {
      const runtime: any = (window as any).__VELO_MERCHANT_WALLETS;
      if (runtime && typeof runtime === "object" && runtime[chain]) {
        return String(runtime[chain]);
      }
    }

    const walletMap: { [key: string]: string | undefined } = {
      ethereum: process.env.NEXT_PUBLIC_ETH_WALLET,
      bitcoin: process.env.NEXT_PUBLIC_BTC_WALLET,
      solana: process.env.NEXT_PUBLIC_SOL_WALLET,
      stellar: process.env.NEXT_PUBLIC_XLM_WALLET,
      polkadot: process.env.NEXT_PUBLIC_DOT_WALLET,
      starknet: process.env.NEXT_PUBLIC_STRK_WALLET,
      "usdt-erc20": process.env.NEXT_PUBLIC_USDT_WALLET,
    };
    return walletMap[chain] || "";
  }, []);

  // Fetch providers based on type
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      if (type === "electricity") {
        const { companies } = await apiClient.getElectricitySupportedOptions();
        setElectricityCompanies(companies);

        const mappedProviders: Provider[] = companies.map((company) => ({
          serviceID: company.value,
          name: company.label,
          image: `/img/${company.value}.png`,
          code: company.code,
          minAmount: company.minAmount,
          maxAmount: company.maxAmount,
        }));
        setProviders(mappedProviders);
      } else {
        const networks =
          type === "data"
            ? await apiClient.getDataSupportedNetworks()
            : await apiClient.getAirtimeSupportedNetworks();

        const mappedProviders: Provider[] = networks.map((network) => ({
          serviceID: network.value,
          name: network.label,
          image: `/img/${network.value.toLowerCase()}.png`,
        }));
        setProviders(mappedProviders);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      setErrorMessage("Failed to load providers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Fetch data plans for selected network
  const fetchDataPlans = useCallback(async (network: string) => {
    setLoading(true);
    try {
      const plans = await apiClient.getDataPlans(network, false);
      setDataPlans(plans);
    } catch (error) {
      console.error("Failed to fetch data plans:", error);
      setErrorMessage("Failed to load data plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch meter types for electricity
  const fetchMeterTypes = useCallback(async () => {
    setLoading(true);
    try {
      const { meterTypes: types } = await apiClient.getElectricitySupportedOptions();
      setMeterTypes(types);
    } catch (error) {
      console.error("Failed to fetch meter types:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify meter number
  const handleVerifyMeter = useCallback(async () => {
    if (!formData.customer_id || !formData.service_id) {
      toast.error("Please enter meter number and select provider");
      return;
    }

    setVerifyingMeter(true);
    setMeterVerificationMessage("");

    try {
      const result = await apiClient.verifyElectricityMeter(
        formData.service_id,
        formData.customer_id
      );

      if (result.success && result.data && result.data.valid) {
        setMeterVerified(true);
        const customerInfo = result.data.customerName
          ? `✓ ${result.data.customerName} `
          : `✓ Meter verified: ${result.data.company}`;
        toast.success(customerInfo);
      } else {
        setMeterVerified(false);
        toast.error(result.message || "✗ Invalid meter number");
      }
    } catch (error: any) {
      setMeterVerified(false);
      toast.error(
        error.message || "Verification failed. Please try again."
      );
    } finally {
      setVerifyingMeter(false);
    }
  }, [formData.customer_id, formData.service_id]);

  // Get expected crypto amount
  const fetchExpectedAmount = useCallback(async () => {
    try {
      let expectedAmount: ExpectedAmount;

      if (type === "airtime") {
        const amount = parseFloat(formData.amount);
        expectedAmount = await apiClient.getAirtimeExpectedAmount(
          amount,
          selectedToken
        );
      } else if (type === "electricity") {
        const amount = parseFloat(formData.amount);
        expectedAmount = await apiClient.getElectricityExpectedAmount(
          amount,
          selectedToken
        );
      } else if (type === "data" && formData.dataplan) {
        expectedAmount = await apiClient.getDataExpectedAmount(
          formData.dataplan.dataplanId,
          formData.service_id,
          selectedToken
        );
      } else {
        throw new Error("Invalid purchase configuration");
      }

      setFormData((prev) => ({ ...prev, expectedAmount }));
    } catch (error: any) {
      console.error("Failed to fetch expected amount:", error);
      setErrorMessage(error.message || "Failed to calculate crypto amount");
    }
  }, [type, formData.amount, formData.dataplan, formData.service_id, selectedToken]);

  // Current wallet balance for selected token
  const currentWalletBalance = useMemo(() => {
    const balanceInfo = balances.find(
      (b) => (b.chain || "").toLowerCase() === selectedToken.toLowerCase()
    );
    return parseFloat(balanceInfo?.balance || "0");
  }, [balances, selectedToken]);

  // Current wallet address for selected token
  const currentWalletAddress = useMemo(() => {
    if (!addresses) return "";
    const addressInfo = addresses.find(
      (addr) => (addr.chain || "").toLowerCase() === selectedToken.toLowerCase()
    );
    return addressInfo?.address || "";
  }, [addresses, selectedToken]);

  // Current network for selected token
  const currentNetwork = useMemo(() => {
    if (!addresses) return "testnet";
    const addressInfo = addresses.find(
      (addr) => (addr.chain || "").toLowerCase() === selectedToken.toLowerCase()
    );
    return addressInfo?.network || "testnet";
  }, [addresses, selectedToken]);

  // Required crypto amount
  const requiredCryptoAmount = useMemo(() => {
    if (!formData.expectedAmount?.cryptoAmount) return 0;
    const amount = formData.expectedAmount.cryptoAmount;
    return Math.ceil(amount * 1e7) / 1e7;
  }, [formData.expectedAmount]);

  // Estimate crypto from exchange rates fallback
  const estimateCryptoFromRates = useCallback(
    (ngnAmount: number, token: string) => {
      try {
        const r: any = rates || {};
        const rateFor = r[token];
        if (!rateFor || !rateFor.ngn) return 0;
        const crypto = ngnAmount / parseFloat(String(rateFor.ngn));
        return Math.ceil(crypto * 1e7) / 1e7;
      } catch (e) {
        return 0;
      }
    },
    [rates]
  );

  // Find token with sufficient balance
  const findTokenWithSufficientBalance = useCallback(
    (ngnAmount: number) => {
      const rateMap: any = rates || {};
      const candidates = (balances || [])
        .map((b: any) => {
          const token = b.chain;
          const bal = parseFloat(b.balance || "0");
          const rate = rateMap[token]?.ngn ? parseFloat(rateMap[token].ngn) : 0;
          return { token, bal, rate, ngnValue: bal * (rate || 0) };
        })
        .sort((a: any, b: any) => b.ngnValue - a.ngnValue);

      const curr = candidates.find((c: any) => c.token === selectedToken);
      if (curr && curr.ngnValue >= ngnAmount) return curr.token;

      const found = candidates.find((c: any) => c.ngnValue >= ngnAmount);
      return found ? found.token : null;
    },
    [balances, rates, selectedToken]
  );

  // Validation error
  const validationError = useMemo(() => {
    const merchantAddress = getToAddress(selectedToken.toLowerCase()) || "";

    if (!currentWalletAddress) {
      return "No wallet found for this currency. Add a wallet or select another currency.";
    }

    if (!merchantAddress && process.env.NODE_ENV === "production") {
      return `Merchant wallet for ${selectedToken.toUpperCase()} is not configured.`;
    }

    if (!toAddress.trim()) {
      return "Recipient address is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return "Amount must be greater than 0";
    }

    if (requiredCryptoAmount > currentWalletBalance) {
      return "Insufficient balance";
    }

    if (type === "electricity" && config.showVerifyButton && !meterVerified) {
      return "Please verify meter number first";
    }

    return null;
  }, [
    currentWalletAddress,
    selectedToken,
    toAddress,
    formData.amount,
    requiredCryptoAmount,
    currentWalletBalance,
    type,
    config.showVerifyButton,
    meterVerified,
    getToAddress,
  ]);

  // Handle token selection
  const handleTokenSelect = useCallback((chain: string) => {
    setSelectedToken(chain);
    const addr = getToAddress(chain.toLowerCase());
    if (addr) {
      setToAddress(addr);
    }
  }, [getToAddress]);

  // Handle send transaction with PIN
  const handleSendWithPin = useCallback(async (pin: string) => {
  console.log("phone number", validatePhoneNumber(formData.customer_id),)

    setErrorMessage("");

    if (validationError) {
      setErrorMessage(validationError);
      setShowPinDialog(false);
      return;
    }

    setIsSending(true);

    try {
      let normalizedToAddress = toAddress.trim();

      if (selectedToken === "starknet") {
        try {
          normalizedToAddress = normalizeStarknetAddress(toAddress, "starknet");
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? `Invalid Starknet address: ${error.message}`
              : "Invalid Starknet address format"
          );
        }
      }

      // Dev mode simulation for self-transfers
      // if (normalizedToAddress === currentWalletAddress) {
      //   if (process.env.NODE_ENV === "production") {
      //     throw new Error("Recipient address cannot be the same as the sender.");
      //   }

      // }

      const transactionResponse = await sendTransaction({
        chain: selectedToken,
        network: currentNetwork,
        toAddress: normalizedToAddress,
        amount: requiredCryptoAmount.toString(),
        fromAddress: currentWalletAddress,
        transactionPin: pin,
      });

      setTxHash(transactionResponse.txHash);
      setShowPinDialog(false);

      await handleSubmitPurchase(transactionResponse.txHash);
      setStep(4);
    } catch (error: any) {
      console.error("Transaction error:", error);
      let errMsg = "Failed to send transaction. Please try again.";

      if (error.message) {
        errMsg = error.message;
      } else if (typeof error === "string") {
        errMsg = error;
      }

      setErrorMessage(errMsg);
      setShowPinDialog(false);
    } finally {
      setIsSending(false);
    }
  }, [
    validationError,
    toAddress,
    selectedToken,
    currentWalletAddress,
    currentNetwork,
    requiredCryptoAmount,
    sendTransaction,
  ]);

  // Submit purchase to backend
  const handleSubmitPurchase = useCallback(async (transactionHash: string) => {
    setLoading(true);

    try {
      let response;

      if (type === "airtime") {
        const provider = providers.find((p) => p.serviceID === formData.service_id) || null;
        const metadata = {
          provider,
          expectedAmount: formData.expectedAmount || null,
          selectedToken,
          fromAddress: currentWalletAddress,
          merchantAddress: getToAddress(selectedToken),
          purchaseType: "AirtimePurchase",
        };

        response = await apiClient.purchaseAirtime({
          type: "airtime",
          amount: parseFloat(formData.amount),
          chain: selectedToken,
          phoneNumber: validatePhoneNumber(formData.customer_id),
          mobileNetwork: formData.service_id,
          transactionHash,
        } as any);
      } else if (type === "data" && formData.dataplan) {
        const provider = providers.find((p) => p.serviceID === formData.service_id) || null;
        // const metadata = {
        //   provider,
        //   dataplan: formData.dataplan,
        //   expectedAmount: formData.expectedAmount || null,
        //   selectedToken,
        //   fromAddress: currentWalletAddress,
        //   merchantAddress: getToAddress(selectedToken),
        //   purchaseType: "DataPurchase",
        // };

        response = await apiClient.purchaseData({
          type: "data",
          dataplanId: formData.dataplan.dataplanId,
          amount: parseFloat(formData.dataplan.amount.replace(/[N₦,]/g, "")),
          chain: selectedToken,
          phoneNumber: validatePhoneNumber(formData.customer_id),
          mobileNetwork: formData.service_id,
          transactionHash,
        } as any);
      } else if (type === "electricity") {
        const companyInfo = electricityCompanies.find((c) => c.value === formData.service_id) || null;
        const metadata = {
          company: companyInfo,
          expectedAmount: formData.expectedAmount || null,
          selectedToken,
          fromAddress: currentWalletAddress,
          merchantAddress: getToAddress(selectedToken),
          purchaseType: "ElectricityPurchase",
        };

        response = await apiClient.purchaseElectricity({
          type: "electricity",
          amount: parseFloat(formData.amount),
          chain: selectedToken,
          company: formData.service_id,
          meterType: formData.meterType,
          meterNumber: formData.customer_id,
          phoneNumber: validatePhoneNumber(formData.phoneNo),
          transactionHash,
        } as any);
      } else {
        throw new Error("Invalid purchase type");
      }

      if (response.success) {
        setSuccess(true);
        setTransactionData(response.data);
      } else {
        setSuccess(false);
        setErrorMessage(response.message || "Purchase failed");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      setSuccess(false);
      setErrorMessage(error.message || "Failed to complete purchase");
    } finally {
      setLoading(false);
    }
  }, [
    type,
    providers,
    electricityCompanies,
    formData,
    selectedToken,
    currentWalletAddress,
    getToAddress,
  ]);

  // Step 1 validation
  const isStep1Valid = useCallback(() => {
    if (!formData.service_id) return false;
    if (!formData.customer_id) return false;

    if (type === "data" && !formData.dataplan) return false;
    if ((type === "airtime" || type === "electricity") && !formData.amount)
      return false;
    if (
      type === "electricity" &&
      config.showVerifyButton &&
      !meterVerified &&
      !formData.phoneNo
    )
      return false;

    return true;
  }, [formData, type, meterVerified, config]);

  // Handlers
  const handleBack = useCallback(() => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep((prev) => prev - 1);
      setErrorMessage("");
    }
  }, [step]);

  const handleNext = useCallback(() => {
    setErrorMessage("");
    setStep((prev) => prev + 1);
  }, []);

  const handleConfirm = useCallback(() => {
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setShowPinDialog(true);
  }, [validationError]);

  const resetForm = useCallback(() => {
    setFormData({
      service_id: "",
      amount: "",
      customer_id: "",
      meterType: "prepaid",
      dataplan: null,
      expectedAmount: null,
      transactionData: null,
      phoneNo: "",
    });
    setToAddress("");
    setTxHash("");
    setErrorMessage("");
    setMeterVerified(false);
    setMeterVerificationMessage("");
    setSuccess(null);
    setStep(1);
  }, []);

  // Effects
  useEffect(() => {
    fetchProviders();
    if (type === "electricity") {
      fetchMeterTypes();
    }
  }, [type, fetchProviders, fetchMeterTypes]);

  useEffect(() => {
    if (type === "data" && formData.service_id) {
      fetchDataPlans(formData.service_id);
    }
  }, [type, formData.service_id, fetchDataPlans]);

  useEffect(() => {
    if (step === 2 && selectedToken) {
      fetchExpectedAmount();
    }
  }, [step, selectedToken, fetchExpectedAmount]);

  useEffect(() => {
    // Auto-fill recipient address
    try {
      const addr = getToAddress(selectedToken.toLowerCase());
      if (addr && !toAddress) {
        setToAddress(addr);
      }
    } catch (e) {
      // ignore
    }
  }, [selectedToken, addresses, toAddress, getToAddress]);

  useEffect(() => {
    // Dev-only fallback
    if (process.env.NODE_ENV === "production") return;
    try {
      const addr = getToAddress(selectedToken.toLowerCase());
      if (!addr && !toAddress && currentWalletAddress) {
        setToAddress(currentWalletAddress);
        setMerchantFallback(true);
      } else {
        setMerchantFallback(false);
      }
    } catch (e) {
      // ignore
    }
  }, [selectedToken, addresses, currentWalletAddress, toAddress, getToAddress]);

  useEffect(() => {
    // Auto-select token with sufficient balance
    if (step !== 2) return;
    const ngnAmount = parseFloat(formData.amount || "0");
    if (!ngnAmount || ngnAmount <= 0) return;

    const expected = formData.expectedAmount;
    if (expected && expected.cryptoAmount && expected.cryptoCurrency) {
      const expectedToken = expected.chain || expected.cryptoCurrency?.toLowerCase();
      if (expectedToken && expectedToken !== selectedToken) {
        setSelectedToken(expectedToken);
        setToAddress(getToAddress(expectedToken));
      }
      return;
    }

    const candidate = findTokenWithSufficientBalance(ngnAmount);
    if (candidate && candidate !== selectedToken) {
      setSelectedToken(candidate);
      setToAddress(getToAddress(candidate));
    }
  }, [step, formData.amount, formData.expectedAmount, findTokenWithSufficientBalance, selectedToken, getToAddress]);

  return {
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
    txHash,
    merchantFallback,
    
    // Setters
    setStep,
    setFormData,
    setShowPinDialog,
    setErrorMessage,
    
    // Handlers
    handleBack,
    handleNext,
    handleConfirm,
    handleTokenSelect,
    handleSendWithPin,
    handleVerifyMeter,
    resetForm,
    
    // Validation
    isStep1Valid,
    validationError,
    
    // Utilities
    config,
    presetAmounts,
    requiredCryptoAmount,
    currentWalletBalance,
    currentWalletAddress,
    currentNetwork,
    
    // Data
    getToAddress,
  };
}