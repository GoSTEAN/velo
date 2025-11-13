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
} from "lucide-react";
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

        console.log("providers xxxxxxxxx ", mappedProviders);
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

        console.log("Airtime/Data providers loaded:", mappedProviders);
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

      console.log("results: ", result);

      // FIXED: Check the direct success property and data.valid
      if (result.success && result.data && result.data.valid) {
        setMeterVerified(true);
        console.log("meter", result.data);

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

  console.log("calidate phone number", validatePhoneNumber("08101843464"));

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
    const balanceInfo = balances.find((b) => b.chain === selectedToken);
    return parseFloat(balanceInfo?.balance || "0");
  }, [balances, selectedToken]);

  const currentWalletAddress = useMemo(() => {
    if (!addresses) return "";
    const addressInfo = addresses.find((addr) => addr.chain === selectedToken);
    return addressInfo?.address || "";
  }, [addresses, selectedToken]);

  console.log("current wallet", currentWalletAddress);
  const currentNetwork = useMemo(() => {
    if (!addresses) return "testnet";
    const addressInfo = addresses.find((addr) => addr.chain === selectedToken);
    return addressInfo?.network || "testnet";
  }, [addresses, selectedToken]);

  const requiredCryptoAmount = useMemo(() => {
    if (!formData.expectedAmount?.cryptoAmount) return 0;

    const amount = formData.expectedAmount.cryptoAmount;
    // Always round UP to 7 decimal places
    return Math.ceil(amount * 1e7) / 1e7;
  }, [formData.expectedAmount]);

  const validationError = useMemo(() => {
    if (!currentWalletAddress) {
      return "No wallet found for this currency";
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
    toAddress,
    formData.amount,
    requiredCryptoAmount,
    currentWalletBalance,
    type,
    config.showVerifyButton,
    meterVerified,
  ]);

  console.log("validation Error", validationError);

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
        response = await apiClient.purchaseAirtime({
          type: "airtime",
          amount: parseFloat(formData.amount),
          chain: selectedToken,
          phoneNumber: validatePhoneNumber(formData.customer_id),
          mobileNetwork: formData.service_id,
          transactionHash,
        });
      } else if (type === "data" && formData.dataplan) {
        response = await apiClient.purchaseData({
          type: "data",
          dataplanId: formData.dataplan.dataplanId,
          amount: parseFloat(formData.dataplan.amount.replace(/[N₦,]/g, "")),
          chain: selectedToken,
          phoneNumber: validatePhoneNumber(formData.customer_id),
          mobileNetwork: formData.service_id,
          transactionHash,
        });
      } else if (type === "electricity") {
        response = await apiClient.purchaseElectricity({
          type: "electricity",
          amount: parseFloat(formData.amount),
          chain: selectedToken,
          company: formData.service_id,
          meterType: formData.meterType,
          meterNumber: formData.customer_id,
          phoneNumber: validatePhoneNumber(formData.phoneNo),
          transactionHash,
        });
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

  console.log("data", data);

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
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-black">{config.step1Title}</h2>
              <p className="text-gray-600">{config.step1Description}</p>
            </div>

            <div className="space-y-6">
              {/* Provider Selection */}
              <ProviderSelect
                providers={providers}
                value={formData.service_id}
                onChange={(service_id: string) => {
                  setFormData((prev) => ({
                    ...prev,
                    service_id,
                    dataplan: null,
                    amount: "",
                  }));
                  setMeterVerified(false);
                  setMeterVerificationMessage("");
                }}
                loading={loading}
              />

              {/* Meter Type Selection (Electricity only) */}
              {config.showMeterType && formData.service_id && (
                <MeterTypeSelect
                  meterTypes={meterTypes}
                  value={formData.meterType}
                  onChange={(meterType: "prepaid" | "postpaid") =>
                    setFormData((prev) => ({ ...prev, meterType }))
                  }
                />
              )}

              {/* Data Plan Selection */}
              {config.showVariations && formData.service_id && (
                <DataPlanSelect
                  dataPlans={dataPlans}
                  value={formData.dataplan}
                  onSelect={(dataplan: DataPlan) =>
                    setFormData((prev) => ({
                      ...prev,
                      dataplan,
                      amount: dataplan.amount.replace(/[N₦,]/g, ""),
                    }))
                  }
                  loading={loading}
                />
              )}

              {/* Amount Grid (Airtime & Electricity) */}
              {config.showAmountGrid && formData.service_id && (
                <AmountGrid
                  value={formData.amount}
                  onChange={(amount: string) =>
                    setFormData((prev) => ({ ...prev, amount }))
                  }
                  presetAmounts={presetAmounts}
                  minAmount={
                    providers.find((p) => p.serviceID === formData.service_id)
                      ?.minAmount
                  }
                  maxAmount={
                    providers.find((p) => p.serviceID === formData.service_id)
                      ?.maxAmount
                  }
                />
              )}

              {/* Customer ID Input */}
              {formData.service_id &&
                (config.showAmountGrid || formData.dataplan) && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">
                      {config.customerLabel}
                    </label>
                    <div className="w-full flex gap-3 items-center">
                      {type !== "electricity" && (
                        <div className="p-4 my-3 rounded-full ">234</div>
                      )}
                      <input
                        value={formData.customer_id}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            customer_id: e.target.value,
                          }));
                          setMeterVerified(false);
                          setMeterVerificationMessage("");
                        }}
                        placeholder={config.placeholder}
                        type="tel"
                        className="flex-1 p-4 rounded-2xl border-none outline-none "
                      />
                      {config.showVerifyButton && formData.customer_id && (
                        <button
                          onClick={handleVerifyMeter}
                          disabled={verifyingMeter}
                          className="px-6 py-4 0 text-white rounded-2xl font-semibold hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                          {verifyingMeter ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify"
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">
                        Phone Number
                      </label>
                      <input
                        value={formData.phoneNo}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            phoneNo: e.target.value,
                          }));
                          setMeterVerified(false);
                          setMeterVerificationMessage("");
                        }}
                        placeholder="08123456789"
                        type="tel"
                        className="flex-1 p-4 rounded-2xl border-none outline-none "
                      />
                    </div>
                    {meterVerificationMessage && (
                      <div
                        className={`text-sm ${
                          meterVerified ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {meterVerificationMessage}
                      </div>
                    )}
                  </div>
                )}

              {errorMessage && (
                <div className="p-4  text-red-600 rounded-2xl flex items-center gap-2">
                  <AlertCircle size={20} />
                  {errorMessage}
                </div>
              )}

              <Button
                onclick={handleNext}
                text="Continue"
                disabled={!isStep1Valid()}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-black">Select Payment Method</h2>
              <p className="text-gray-600">
                Choose your preferred cryptocurrency
              </p>
            </div>

            <AddressDropdown
              selectedToken={selectedToken}
              onTokenSelect={handleTokenSelect}
              showBalance={true}
              showNetwork={false}
              showAddress={true}
              disabled={isSending}
            />

            {formData.expectedAmount && (
              <div className="p-6  rounded-2xl space-y-3">
                <h3 className="font-semibold text-blue-900">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount (NGN):</span>
                    <span className="font-bold">
                      ₦{parseFloat(formData.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Amount ({formData.expectedAmount.cryptoCurrency}):
                    </span>
                    <span className="font-bold">
                      {formData.expectedAmount.cryptoAmount.toFixed(8)}
                    </span>
                  </div>
                  {formData.expectedAmount.planDetails && (
                    <>
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-bold">
                          {formData.expectedAmount.planDetails.name}
                        </span>
                      </div>
                      {formData.expectedAmount.planDetails.validity && (
                        <div className="flex justify-between">
                          <span>Validity:</span>
                          <span className="font-bold">
                            {formData.expectedAmount.planDetails.validity}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4  text-red-600 rounded-2xl flex items-center gap-2">
                <AlertCircle size={20} />
                {errorMessage}
              </div>
            )}

            <div className="flex gap-4">
              <Button onclick={handleBack} text="Back" type="secondary" />
              <Button
                onclick={handleNext}
                text="Continue"
                disabled={!!validationError || !formData.expectedAmount}
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 w-full h-full flex flex-col justify-end"
          >
            <div className="w-full py-5 rounded-t-3xl">
              <div className="space-y-1">
                <h2 className="text-xl font-black w-full text-center">
                  Summary
                </h2>
                <p className="text-center text-gray-600">
                  Review your purchase
                </p>
              </div>

              <div className="w-full rounded-2xl p-6 space-y-4 mt-6">
                <div className="flex w-full justify-between items-center max-w-md mx-auto">
                  <span className="text-xl font-black w-full">
                    ₦{parseInt(formData.amount || "0").toLocaleString()}
                  </span>
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-black w-full text-end">
                    {formData.expectedAmount?.cryptoAmount.toFixed(8)}{" "}
                    {formData.expectedAmount?.cryptoCurrency}
                  </span>
                </div>

                <div className="space-y-3  p-4 rounded-2xl">
                  <ReviewItem label="Product" value={type.toUpperCase()} />
                  <ReviewItem
                    label={type === "electricity" ? "Provider" : "Network"}
                    value={
                      providers.find((p) => p.serviceID === formData.service_id)
                        ?.name || ""
                    }
                  />
                  {type === "data" && formData.dataplan && (
                    <ReviewItem label="Plan" value={formData.dataplan.name} />
                  )}
                  {type === "electricity" && (
                    <ReviewItem
                      label="Meter Type"
                      value={formData.meterType.toUpperCase()}
                    />
                  )}
                  <ReviewItem
                    label={config.customerLabel}
                    value={
                      type === "electricity"
                        ? formData.customer_id
                        : `234${formData.customer_id}`
                    }
                  />
                  <ReviewItem
                    label="Payment Method"
                    value={selectedToken.toUpperCase()}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-4  text-red-600 rounded-2xl flex items-center gap-2 mx-6">
                  <AlertCircle size={20} />
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-4 px-6 mt-6">
                <Button onclick={handleBack} text="Back" type="secondary" />
                <Button
                  onclick={handleConfirm}
                  text="Confirm & Pay"
                  disabled={!!validationError}
                />
              </div>
            </div>

            <TransactionPinDialog
              isOpen={showPinDialog}
              onClose={() => setShowPinDialog(false)}
              onPinComplete={handleSendWithPin}
              isLoading={isSending}
              title="Authorize Transaction"
              description="Enter your transaction PIN to confirm this purchase"
            />
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="space-y-8 text-center rounded-2xl px-3 py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-20 h-20 ${
                  success ? "bg-green-500" : "0"
                } rounded-full flex items-center justify-center mx-auto`}
              >
                {success ? (
                  <Check size={40} className="text-white" />
                ) : (
                  <X size={40} className="text-white" />
                )}
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black">
                  {success ? "Transaction Successful" : "Transaction Failed"}
                </h2>
                <p className="text-lg text-gray-600">
                  {success
                    ? "Your transaction has been processed successfully"
                    : "Something went wrong. Please try again."}
                </p>

                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500">Amount Sent</span>
                  <span className="font-black text-2xl">
                    ₦{parseInt(formData.amount || "0").toLocaleString()}
                  </span>
                </div>

                <div className="space-y-4 my-5 max-w-sm mx-auto">
                  <h5 className="text-center text-sm text-gray-500">
                    Beneficiary
                  </h5>
                  <div className="w-full flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden ">
                        <img
                          src={formData.transactionData?.providerLogo || ""}
                          alt="provider"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">
                          {type === "electricity"
                            ? formData.customer_id
                            : `234${formData.customer_id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {
                            providers.find(
                              (p) => p.serviceID === formData.service_id
                            )?.name
                          }
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={24} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {success && formData.transactionData && (
                <div className=" rounded-2xl p-6 space-y-4 max-w-md mx-auto">
                  <TransactionDetail
                    label="Date & Time"
                    value={formData.transactionData.dateTime}
                  />
                  <TransactionDetail
                    label="Payment Method"
                    value={formData.transactionData.paymentMethod}
                  />
                  <TransactionDetail
                    label="Status"
                    value={formData.transactionData.status}
                    className="text-green-600 font-bold"
                  />
                  <TransactionDetail
                    label="Description"
                    value={formData.transactionData.description}
                  />
                  <TransactionDetail
                    label="Transaction ID"
                    value={formData.transactionData.transactionId}
                    monospace
                  />
                  <TransactionDetail
                    label="Transaction Hash"
                    value={txHash}
                    monospace
                    link={`https://explorer.starknet.io/tx/${txHash}`}
                  />
                  {formData.transactionData.meterToken && (
                    <div className=" rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold text-blue-900">
                        Meter Token
                      </p>
                      <p className="font-mono text-lg text-blue-700 mt-1 break-all">
                        {formData.transactionData.meterToken}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!success && (
                <div className=" rounded-2xl p-4 max-w-md mx-auto">
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 px-4">
              <Button
                onclick={() => {
                  // TODO: Implement share as image
                  alert("Share as image coming soon!");
                }}
                text="Share as Image"
                type="secondary"
              />
              <Button
                onclick={() => {
                  // TODO: Implement share as PDF
                  alert("Share as PDF coming soon!");
                }}
                text="Share as PDF"
              />
            </div>

            <div className="px-4">
              <Button
                onclick={() => {
                  setStep(1);
                  resetForm();
                  setSuccess(null);
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
                }}
                text="New Purchase"
                type="secondary"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto max-w-xl min-h-screen ">
      <div className="p-4 relative min-h-screen flex flex-col">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>
    </div>
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
