"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  PhoneCall,
  Wifi,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Home,
} from "lucide-react";
// import '@/styles/service-styles.css'; 
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TransactionPinDialog } from "../ui/transaction-pin-dialog";
import { normalizeStarknetAddress } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useWalletData } from "../hooks";
import useExchangeRates from "../hooks/useExchangeRate";
import { AddressDropdown } from "../modals/addressDropDown";
import Image from "next/image";
import {
  apiClient,
  type DataPlan,
  type ElectricityCompany,
  type MeterType,
  type ExpectedAmount,
  type SupportedNetwork,
} from "@/lib/api-client";
import { validatePhoneNumber } from "@/lib/utils";

export enum Blockchain {
  ETHEREUM = "ethereum",
  BITCOIN = "bitcoin",
  SOLANA = "solana",
  STELLAR = "stellar",
  POLKADOT = "polkadot",
  STARKNET = "starknet",
  USDT_ERC20 = "usdt-erc20",
}

type PurchaseType = "airtime" | "data" | "electricity";

interface PurchaseProps {
  type: PurchaseType;
}

type TransactionData = {
  dateTime: string;
  paymentMethod: string;
  status: string;
  description: string;
  transactionId: string;
  providerLogo: string;
  providerName: string;
  planName: string;
  meterToken?: string;
};

type Provider = {
  serviceID: string;
  name: string;
  image: string;
  code?: string;
  minAmount?: number;
  maxAmount?: number;
};

export default function Purchase({ type }: PurchaseProps) {
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

  const [formData, setFormData] = useState({
    service_id: "",
    amount: "",
    customer_id: "",
    meterType: "prepaid" as "prepaid" | "postpaid",
    dataplan: null as DataPlan | null,
    expectedAmount: null as ExpectedAmount | null,
    transactionData: null as TransactionData | null,
    phoneNo: "",
  });

  const { sendTransaction } = useAuth();
  const { rates } = useExchangeRates();
  const { addresses, balances } = useWalletData();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [electricityCompanies, setElectricityCompanies] = useState<
    ElectricityCompany[]
  >([]);
  const [meterTypes, setMeterTypes] = useState<MeterType[]>([]);

  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

  const getConfig = () => {
    const config = {
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
      },
    };
    return config[type];
  };

  const getToAddress = (chain: string) => {
    // Allow a runtime override for quick testing in the browser. Set
    // `window.__VELO_MERCHANT_WALLETS = { ethereum: '0x...', solana: '...'}
    // in DevTools to test without restarting the dev server.
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
  };

  const config = getConfig();

  const resetForm = useCallback(() => {
    setToAddress("");
    setTxHash("");
    setErrorMessage("");
    setMeterVerified(false);
    setMeterVerificationMessage("");
  }, []);

  const handleTokenSelect = useCallback((chain: string) => {
    setSelectedToken(chain);
    setToAddress(getToAddress(chain.toLowerCase()));
    // resetForm();
  }, []);

  // Fetch providers based on type
  const fetchProviders = async () => {
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

        // console.log("providers xxxxxxxxx ", mappedProviders);
      } else {
        // For airtime and data
        const networks =
          type === "data"
            ? await apiClient.getDataSupportedNetworks()
            : await apiClient.getAirtimeSupportedNetworks();

        const mappedProviders: Provider[] = networks.map((network) => ({
          serviceID: network.value,
          name: network.label,
          image: `/img/${network.value.toLowerCase()}.png`, // Ensure lowercase
        }));
        setProviders(mappedProviders);

        // console.log("Airtime/Data providers loaded:", mappedProviders);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      setErrorMessage("Failed to load providers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data plans for selected network
  const fetchDataPlans = async (network: string) => {
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
  };

  // Fetch meter types for electricity
  const fetchMeterTypes = async () => {
    setLoading(true);
    try {
      const { meterTypes: types } =
        await apiClient.getElectricitySupportedOptions();
      setMeterTypes(types);
    } catch (error) {
      console.error("Failed to fetch meter types:", error);
    } finally {
      setLoading(false);
    }
  };

  // Verify meter number
  const handleVerifyMeter = async () => {
    if (!formData.customer_id || !formData.service_id) {
      setMeterVerificationMessage(
        "Please enter meter number and select provider"
      );
      return;
    }

    setVerifyingMeter(true);
    setMeterVerificationMessage("");

    try {
      const result = await apiClient.verifyElectricityMeter(
        formData.service_id,
        formData.customer_id
      );

      // console.log("results: ", result);

      // FIXED: Check the direct success property and data.valid
      if (result.success && result.data && result.data.valid) {
        setMeterVerified(true);
        // console.log("meter", result.data);

        // Show customer name if available
        const customerInfo = result.data.customerName
          ? `✓ ${result.data.customerName} `
          : `✓ Meter verified: ${result.data.company}`;

        setMeterVerificationMessage(customerInfo);
      } else {
        setMeterVerified(false);
        setMeterVerificationMessage(result.message || "✗ Invalid meter number");
      }
    } catch (error: any) {
      setMeterVerified(false);
      setMeterVerificationMessage(
        error.message || "Verification failed. Please try again."
      );
    } finally {
      setVerifyingMeter(false);
    }
  };

  // Get expected crypto amount
  const fetchExpectedAmount = async () => {
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
  };

  // console.log("calidate phone number", validatePhoneNumber("08101843464"));

  useEffect(() => {
    fetchProviders();
    if (type === "electricity") {
      fetchMeterTypes();
    }
  }, [type]);

  useEffect(() => {
    if (type === "data" && formData.service_id) {
      fetchDataPlans(formData.service_id);
    }
  }, [type, formData.service_id]);

  useEffect(() => {
    if (step === 2 && selectedToken) {
      fetchExpectedAmount();
    }
  }, [step, selectedToken, formData.amount, formData.dataplan]);

  const currentWalletBalance = useMemo(() => {
    const balanceInfo = balances.find(
      (b) => (b.chain || "").toLowerCase() === selectedToken.toLowerCase()
    );
    return parseFloat(balanceInfo?.balance || "0");
  }, [balances, selectedToken]);

  const currentWalletAddress = useMemo(() => {
    if (!addresses) return "";
    const addressInfo = addresses.find(
      (addr) => (addr.chain || "").toLowerCase() === selectedToken.toLowerCase()
    );
    return addressInfo?.address || "";
  }, [addresses, selectedToken]);

  // console.log("current wallet", currentWalletAddress);
  const currentNetwork = useMemo(() => {
    if (!addresses) return "mainnet";
    const addressInfo = addresses.find(
      (addr) => (addr.chain || "").toLowerCase() === selectedToken.toLowerCase()
    );
    return addressInfo?.network || "mainnet";
  }, [addresses, selectedToken]);

  const requiredCryptoAmount = useMemo(() => {
    if (!formData.expectedAmount?.cryptoAmount) return 0;

    const amount = formData.expectedAmount.cryptoAmount;
    // Always round UP to 7 decimal places
    return Math.ceil(amount * 1e7) / 1e7;
  }, [formData.expectedAmount]);

  // If backend expectedAmount isn't available, we can fall back to local
  // exchange rates to estimate crypto needed: crypto = NGN amount / rate.ngn
  const estimateCryptoFromRates = useCallback(
    (ngnAmount: number, token: string) => {
      try {
        const r: any = (rates as any) || {};
        const rateFor = r[token];
        if (!rateFor || !rateFor.ngn) return 0;
        const crypto = ngnAmount / parseFloat(String(rateFor.ngn));
        // Round up to 7 decimals like other logic
        return Math.ceil(crypto * 1e7) / 1e7;
      } catch (e) {
        return 0;
      }
    },
    [rates]
  );

  // Find a token that has sufficient NGN-equivalent balance to cover the
  // requested fiat amount. Prefers the currently selected token.
  const findTokenWithSufficientBalance = useCallback(
    (ngnAmount: number) => {
      const rateMap: any = (rates as any) || {};
      // Build candidates from balances array
      const candidates = (balances || [])
        .map((b: any) => {
          const token = b.chain;
          const bal = parseFloat(b.balance || "0");
          const rate = rateMap[token]?.ngn ? parseFloat(rateMap[token].ngn) : 0;
          return { token, bal, rate, ngnValue: bal * (rate || 0) };
        })
        .sort((a: any, b: any) => b.ngnValue - a.ngnValue);

      // Try current token first
      const curr = candidates.find((c: any) => c.token === selectedToken);
      if (curr && curr.ngnValue >= ngnAmount) return curr.token;

      // Otherwise pick first candidate with enough NGN value
      const found = candidates.find((c: any) => c.ngnValue >= ngnAmount);
      return found ? found.token : null;
    },
    [balances, rates, selectedToken]
  );

  const validationError = useMemo(() => {
    // Check that there's a configured merchant address for the selected token.
    const merchantAddress = getToAddress(selectedToken.toLowerCase()) || "";

    if (!currentWalletAddress) {
      return "No wallet found for this currency. Add a wallet or select another currency.";
    }

    if (!merchantAddress) {
      // In production we require a configured merchant wallet. In development
      // allow the flow to continue (auto-fallback to user's address) so
      // developers can test payments locally without env vars.
      if (process.env.NODE_ENV === "production") {
        return `Merchant wallet for ${selectedToken.toUpperCase()} is not configured. Set NEXT_PUBLIC_${selectedToken.toUpperCase()}_WALLET or set window.__VELO_MERCHANT_WALLETS in DevTools.`;
      }
      // In dev, we don't block here — a dev-only fallback will be applied.
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
  ]);

  useEffect(() => {
    // Auto-fill recipient address when a token is selected or when wallet
    // addresses change so the validation doesn't fail immediately on mount.
    try {
      const addr = getToAddress(selectedToken.toLowerCase());
      if (addr && !toAddress) {
        setToAddress(addr);
      }
    } catch (e) {
      // ignore
    }
  }, [selectedToken, addresses]);

  // Dev-only fallback: if there's no configured merchant address, auto-fill
  // with the current user's wallet address so developers can test the flow.
  useEffect(() => {
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
  }, [selectedToken, addresses, currentWalletAddress, toAddress]);

  // When validation prevents proceeding to Confirm & Pay, surface a compact
  // debug summary so developers can quickly see why without sifting through
  // repeated console messages. This is intentionally a warning-level log.
  useEffect(() => {
    if (!validationError) return;
    // Only surface developer warnings in non-production to reduce console noise
    if (process.env.NODE_ENV !== "production") {
      console.warn("Purchase validation blocked action:", {
        validationError,
        selectedToken,
        toAddress,
        requiredCryptoAmount,
        currentWalletBalance,
        currentWalletAddress,
      });
    }
  }, [validationError, selectedToken, toAddress, requiredCryptoAmount, currentWalletBalance, currentWalletAddress]);

  // When step 2 (payment) is entered and expectedAmount is available (or
  // an NGN amount is entered), try to auto-select a token that has enough
  // NGN-equivalent balance so the user doesn't hit "Insufficient balance".
  useEffect(() => {
    if (step !== 2) return;
    const ngnAmount = parseFloat(formData.amount || "0");
    if (!ngnAmount || ngnAmount <= 0) return;

    // If backend provided expectedAmount, use that crypto amount and token
    const expected = formData.expectedAmount;
    if (expected && expected.cryptoAmount && expected.cryptoCurrency) {
      // ensure selected token matches expected currency
      const expectedToken = expected.chain || expected.cryptoCurrency?.toLowerCase();
      if (expectedToken && expectedToken !== selectedToken) {
        setSelectedToken(expectedToken);
        setToAddress(getToAddress(expectedToken));
      }
      return;
    }

    // Fallback: find a token with sufficient NGN equivalent value
    const candidate = findTokenWithSufficientBalance(ngnAmount);
    if (candidate && candidate !== selectedToken) {
      setSelectedToken(candidate);
      setToAddress(getToAddress(candidate));
    }
  }, [step, formData.amount, formData.expectedAmount, findTokenWithSufficientBalance]);

  const handleSendWithPin = async (pin: string) => {
    setErrorMessage("");

    if (validationError) {
      setErrorMessage(validationError);
      setShowPinDialog(false);
      return;
    }

    setIsSending(true);

    try {
      // Step 1: Send cryptocurrency transaction
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
      // If recipient equals the sender, handle safely depending on environment.
      // - In development, simulate a transaction so developers can test the
      //   purchase flow without triggering backend validation (send-to-self).
      // - In production, block the action to avoid accidental send-to-self.
      if (normalizedToAddress === currentWalletAddress) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("Recipient address cannot be the same as the sender.");
        }

        // Dev behaviour: if we're already in a merchantFallback or the
        // recipient equals the current wallet, simulate a tx so the rest of
        // the purchase flow can be tested end-to-end without calling the
        // backend /wallet/send with an invalid payload.
        console.warn(
          "Dev-mode: recipient equals sender — simulating transaction. Set a merchant wallet to test real sends."
        );
        const fakeHash = `dev-tx-${Date.now()}`;
        setTxHash(fakeHash);
        setShowPinDialog(false);
        await handleSubmitPurchase(fakeHash);
        setStep(4);
        return;
      }

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

      // Step 2: Submit purchase to backend with transaction hash
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
  };

  const handleSubmitPurchase = async (transactionHash: string) => {
    setLoading(true);

    try {
      let response;

      if (type === "airtime") {
        // Include metadata so backend has provider/expectedAmount/context
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
          metadata,
        } as any);
      } else if (type === "data" && formData.dataplan) {
        const provider = providers.find((p) => p.serviceID === formData.service_id) || null;
        const metadata = {
          provider,
          dataplan: formData.dataplan,
          expectedAmount: formData.expectedAmount || null,
          selectedToken,
          fromAddress: currentWalletAddress,
          merchantAddress: getToAddress(selectedToken),
          purchaseType: "DataPurchase",
        };

        response = await apiClient.purchaseData({
          type: "data",
          dataplanId: formData.dataplan.dataplanId,
          amount: parseFloat(formData.dataplan.amount.replace(/[N₦,]/g, "")),
          chain: selectedToken,
          phoneNumber: validatePhoneNumber(formData.customer_id),
          mobileNetwork: formData.service_id,
          transactionHash,
          metadata,
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
          metadata,
        } as any);
      } else {
        throw new Error("Invalid purchase type");
      }

      if (response.success) {
        setSuccess(true);

        const transactionData: TransactionData = {
          dateTime: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          }),
          paymentMethod: "Cashley",
          status: "Completed",
          description: response.message,
          transactionId: response.data.purchaseId,
          providerLogo:
            providers.find((p) => p.serviceID === formData.service_id)?.image ||
            "",
          providerName:
            providers.find((p) => p.serviceID === formData.service_id)?.name ||
            "",
          planName:
            response.data.planName ||
            formData.dataplan?.name ||
            `₦${formData.amount}`,
          meterToken: response.data.meterToken,
        };

        setFormData((prev) => ({ ...prev, transactionData }));
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
  };

  const handleBack = () => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep((prev) => prev - 1);
      setErrorMessage("");
    }
  };

  const handleNext = () => {
    setErrorMessage("");
    setStep((prev) => prev + 1);
  };

  const handleConfirm = () => {
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setShowPinDialog(true);
  };

  const data = {
    serviceId: formData.service_id,
    customerId: formData.customer_id,
  };

  // console.log("data", data);

  const isStep1Valid = () => {
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
  };

 const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Provider Selection */}
            <div className="space-y-3">
              <label className="block text-white text-sm">Select Provider</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {providers.map((provider) => (
                  <motion.button
                    key={provider.serviceID}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, service_id: provider.serviceID }))
                    }
                    className={`flex-shrink-0 p-4 rounded-2xl transition-all ${
                      formData.service_id === provider.serviceID
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg ring-2 ring-white/50"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl mb-1">{provider.name[0]}</div>
                      <div className="text-xs">{provider.name}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Amount Grid */}
            {config.showAmountGrid && formData.service_id && (
              <div className="space-y-3">
                <label className="block text-white text-sm">Select Amount</label>
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map((amount) => (
                    <motion.button
                      key={amount}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData((prev) => ({ ...prev, amount: amount.toString() }))}
                      className={`p-3 rounded-xl transition-all ${
                        formData.amount === amount.toString()
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                          : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      ₦{amount.toLocaleString()}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Phone/Meter Number Input */}
            {formData.service_id && (config.showAmountGrid || type === "data") && (
              <div className="space-y-3">
                <label className="block text-white text-sm">{config.customerLabel}</label>
                <div className="flex gap-2">
                  {type !== "electricity" && (
                    <div className="px-4 py-3 rounded-xl bg-white/10 text-white">234</div>
                  )}
                  <input
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customer_id: e.target.value }))
                    }
                    placeholder={config.placeholder}
                    type="tel"
                    className="flex-1 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Phone Number for Electricity */}
            {type === "electricity" && formData.customer_id && (
              <div className="space-y-3">
                <label className="block text-white text-sm">Phone Number</label>
                <input
                  value={formData.phoneNo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneNo: e.target.value }))
                  }
                  placeholder="08123456789"
                  type="tel"
                  className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle size={20} />
                {errorMessage}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!isStep1Valid()}
              className={`w-full p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                isStep1Valid()
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mr-4"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <h2 className="text-white">Select Payment Method</h2>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center text-white">
                <div>
                  <p className="text-gray-300 text-sm">Amount</p>
                  <p className="text-2xl">₦{parseInt(formData.amount || "0").toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm">Provider</p>
                  <p>{providers.find(p => p.serviceID === formData.service_id)?.name}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Ethereum", "Bitcoin", "USDT", "Solana"].map((crypto) => (
                <motion.button
                  key={crypto}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedToken(crypto.toLowerCase())}
                  className={`p-6 rounded-2xl transition-all ${
                    selectedToken === crypto.toLowerCase()
                      ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{crypto[0]}</div>
                    <div className="text-sm">{crypto}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex-1 p-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mr-4"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <h2 className="text-white">Transaction Summary</h2>
            </div>

            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 space-y-4">
              <div className="flex justify-between text-white">
                <span className="text-gray-400">Product</span>
                <span className="capitalize">{type}</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-gray-400">Provider</span>
                <span>{providers.find(p => p.serviceID === formData.service_id)?.name}</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-gray-400">{config.customerLabel}</span>
                <span>{type !== "electricity" ? `234${formData.customer_id}` : formData.customer_id}</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-gray-400">Payment Method</span>
                <span className="capitalize">{selectedToken}</span>
              </div>
              <div className="flex justify-between text-white pt-4 border-t border-white/10">
                <span className="text-gray-400">Total Amount</span>
                <span className="text-2xl">₦{parseInt(formData.amount || "0").toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="flex-1 p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="flex-1 p-4 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Confirm & Pay
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="flex justify-center mb-6"
            >
              {success ? (
                <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-16 h-16 text-white" />
                </div>
              ) : (
                <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-16 h-16 text-white" />
                </div>
              )}
            </motion.div>

            <div>
              <h2 className="text-white text-2xl mb-2">
                {success ? "Transaction Successful!" : "Transaction Failed"}
              </h2>
              <p className="text-gray-300">
                {success
                  ? "Your transaction has been processed successfully"
                  : "Something went wrong. Please try again."}
              </p>
            </div>

            {success && (
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-3 text-white">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span>₦{parseInt(formData.amount || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Provider</span>
                  <span>{providers.find(p => p.serviceID === formData.service_id)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400">Completed</span>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetForm}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              New Purchase
            </motion.button>

            {/* Confetti effect */}
            {success && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
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
                      backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"][i % 6],
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* PIN Dialog */}
      {showPinDialog && (
        <PinDialog
          onClose={() => setShowPinDialog(false)}
          onSubmit={handleSendWithPin}
          isLoading={isSending}
        />
      )}

      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
    </div>
  );
}

// PIN Dialog Component
function PinDialog({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (pin: string) => void;
  isLoading: boolean;
}) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every((digit) => digit !== "") && index === 3) {
      onSubmit(newPin.join(""));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border border-white/20"
      >
        <h2 className="text-white text-2xl mb-6 text-center">Enter PIN</h2>

        <div className="flex justify-center gap-4 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              disabled={isLoading}
              className="w-16 h-20 text-center bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white text-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all"
            />
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-3 text-cyan-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}


// === MISSING SUB-COMPONENTS (Added) ===

function DataPlanSelect({
  dataPlans,
  value,
  onSelect,
  loading,
}: {
  dataPlans: DataPlan[];
  value: DataPlan | null;
  onSelect: (plan: DataPlan) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <label className="text-sm font-semibold">Select Data Plan</label>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-0.5 bg-gray-200 animate-pulse"
            >
              <div className="w-full p-5 rounded-2xl bg-gray-200 h-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold">Select Data Plan</label>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-h-96 overflow-y-auto">
        {dataPlans.map((plan) => (
          <div
            key={plan.dataplanId}
            className={`rounded-2xl p-0.5 ${
              value?.dataplanId === plan.dataplanId
                ? "ring-2 ring-blue-500"
                : ""
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(plan)}
              className="w-full p-4 rounded-2xl text-left transition-all "
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-sm">{plan.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{plan.validity}</p>
                </div>
                <span className="text-lg font-bold">
                  ₦
                  {parseInt(plan.amount.replace(/[N₦,]/g, "")).toLocaleString()}
                </span>
              </div>
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeterTypeSelect({
  meterTypes,
  value,
  onChange,
}: {
  meterTypes: MeterType[];
  value: "prepaid" | "postpaid";
  onChange: (type: "prepaid" | "postpaid") => void;
}) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold">Meter Type</label>
      <div className="grid grid-cols-2 gap-3">
        {meterTypes.map((type) => (
          <motion.button
            key={type.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(type.value as "prepaid" | "postpaid")}
            className={`p-4 rounded-2xl font-bold transition-all ${
              value === type.value
                ? "ring-2 ring-blue-500 text-blue-700"
                : " text-gray-700"
            }`}
          >
            {type.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// === REUSABLE TRANSACTION DETAIL COMPONENT ===
function TransactionDetail({
  label,
  value,
  monospace = false,
  link,
  className = "",
}: {
  label: string;
  value: string;
  monospace?: boolean;
  link?: string;
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-gray-600">{label}</span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-blue-600 underline"
        >
          {value.slice(0, 10)}...{value.slice(-8)}
        </a>
      ) : (
        <span className={`font-medium ${monospace ? "font-mono text-sm" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}

// Sub-components
function ProviderSelect({
  providers,
  value,
  onChange,
  loading,
}: {
  providers: Provider[];
  value: string;
  onChange: (service_id: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-0.5 bg-gray-200 animate-pulse"
            >
              <div className="flex flex-col items-center w-full rounded-2xl overflow-hidden bg-gray-200 h-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className=" flex items-center overflow-x-scroll w-full gap-4">
        {providers.map((provider) => (
          <div
            key={provider.serviceID}
            className={`rounded-xl p-0.5 flex flex-none max-w-25 w-full  ${
              value === provider.serviceID ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(provider.serviceID)}
              className="flex flex-col items-center w-full rounded-2xl overflow-hidden transition-all "
            >
              <div className="w-full h-20 relative rounded-lg overflow-hidden">
                <Image
                  src={provider.image}
                  alt={provider.name}
                  fill
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to a default image or show provider name
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">${provider.name.substring(
                      0,
                      3
                    )}</div>`;
                  }}
                />
              </div>
              <span className="text-sm font-medium py-2 text-center">
                {provider.name}
              </span>
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmountGrid({
  value,
  onChange,
  presetAmounts,
  minAmount,
  maxAmount,
}: {
  value: string;
  onChange: (amount: string) => void;
  presetAmounts: number[];
  minAmount?: number;
  maxAmount?: number;
}) {
  const numericValue = parseFloat(value) || 0;

  const isBelowMin =
    minAmount !== undefined && numericValue > 0 && numericValue < minAmount;
  const isAboveMax = maxAmount !== undefined && numericValue > maxAmount;

  const filteredPresets = presetAmounts.filter((amount) => {
    if (minAmount !== undefined && amount < minAmount) return false;
    if (maxAmount !== undefined && amount > maxAmount) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold">Amount</label>
        {(minAmount || maxAmount) && (
          <span className="text-xs text-gray-500">
            {minAmount && `Min: ₦${minAmount.toLocaleString()}`}
            {minAmount && maxAmount && " • "}
            {maxAmount && `Max: ₦${maxAmount.toLocaleString()}`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filteredPresets.length > 0 ? (
          filteredPresets.map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(amount.toString())}
              className={`p-4 rounded-2xl transition-all font-medium ${
                value === amount.toString()
                  ? "font-black ring-2 ring-blue-500"
                  : ""
              }`}
            >
              ₦{amount.toLocaleString()}
            </motion.button>
          ))
        ) : (
          <p className="col-span-3 text-center text-sm text-gray-500">
            No preset amounts available
          </p>
        )}
      </div>

      <div className="relative">
        <input
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^\d*$/.test(val)) {
              onChange(val);
            }
          }}
          placeholder="Enter custom amount"
          type="text"
          inputMode="numeric"
          className={`w-full p-4 rounded-2xl border-2 pr-10 transition-all ${
            isBelowMin || isAboveMax ? "border-red-500 " : "border-transparent "
          } outline-none`}
        />
        {(isBelowMin || isAboveMax) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle size={18} className="text-red-500" />
          </div>
        )}
      </div>

      {(isBelowMin || isAboveMax) && (
        <p className="text-xs text-red-600 -mt-2">
          {isBelowMin
            ? `Amount must be at least ₦${minAmount?.toLocaleString()}`
            : `Amount cannot exceed ₦${maxAmount?.toLocaleString()}`}
        </p>
      )}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Button({
  onclick,
  text,
  disabled,
  type,
}: {
  onclick: () => void;
  text: string;
  disabled?: boolean;
  type?: "secondary";
}) {
  const baseClasses =
    "w-full py-4 rounded-full font-bold text-lg relative transition-all";
  const typeClasses =
    type === "secondary"
      ? "bg-gray-200 text-black hover:bg-gray-300"
      : "0 text-white hover:bg-blue-600";
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";
  return (
    <button
      onClick={onclick}
      disabled={disabled}
      className={`${baseClasses} ${typeClasses} ${disabledClasses}`}
    >
      {text}
    </button>
  );
}
