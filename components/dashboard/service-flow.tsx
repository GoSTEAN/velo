"use client";
 import TextInput from "@/components/ui/TextInput";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Eye,
  EyeOff,
  Wifi,
  Tv,
  PhoneCall,
  ArrowRight,
  Fingerprint,
  Link,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type PurchaseType = "airtime" | "data" | "tv";

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
};

type Provider = {
  service_id: string;
  service_name: string;
  logo: string;
};

type Variation = {
  variation_id: string;
  service_name: string;
  service_id: string;
  price: string;
  data_plan?: string;
  package_bouquet?: string;
};

export default function Purchase({ type }: PurchaseProps) {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [showOTPFull] = useState(false);
  const [reference, setReference] = useState("");

  const [formData, setFormData] = useState({
    service_id: "",
    amount: "",
    customer_id: "",
    variation: null as Variation | null,
    transactionData: null as TransactionData | null,
  });

  const [providers, setProviders] = useState<Provider[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);

  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

  const getConfig = () => {
    const config = {
      airtime: {
        title: "Buy Airtime",
        icon: PhoneCall,
        step1Title: "Select network",
        step1Description: "Choose your network provider",
        customerLabel: "Phone Number",
        placeholder: "+2348012345678",
        showAmountGrid: true,
        showVariations: false,
      },
      data: {
        title: "Purchase Data",
        icon: Wifi,
        step1Title: "Select network",
        step1Description: "Choose your network provider",
        customerLabel: "Phone Number",
        placeholder: "Enter phone number",
        showAmountGrid: false,
        showVariations: true,
      },
      tv: {
        title: "Cable Subscription",
        icon: Tv,
        step1Title: "Select provider",
        step1Description: "Choose your TV service provider",
        customerLabel: "Smartcard Number",
        placeholder: "Enter smartcard number",
        showAmountGrid: false,
        showVariations: true,
      },
    };

    return config[type];
  };

  const config = getConfig();

  // Get dynamic header based on step and user selection
  const getHeaderTitle = () => {
    if (step === 1) return config.step1Title;
    if (step === 2) return "Summary";
    if (step === 3) return "Enter PIN";
    if (step === 4)
      return success ? "Transaction Successful" : "Transaction Failed";
    return config.title;
  };

  // Fetch providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const mockProviders: Provider[] = [
          { service_id: "mtn", service_name: "MTN", logo: "/img/mtn.png" },
          {
            service_id: "airtel",
            service_name: "Airtel",
            logo: "/img/airtel.png",
          },
          { service_id: "glo", service_name: "Glo", logo: "/img/glo.png" },
          {
            service_id: "9mobile",
            service_name: "9mobile",
            logo: "/img/9mobile.png",
          },
        ];

        const tvProviders: Provider[] = [
          { service_id: "dstv", service_name: "DSTV", logo: "/img/dstv.png" },
          { service_id: "gotv", service_name: "GOTV", logo: "/img/gotv.png" },
          {
            service_id: "startimes",
            service_name: "StarTimes",
            logo: "/img/startimes.png",
          },
          {
            service_id: "showmax",
            service_name: "Showmax",
            logo: "/img/shomax.png",
          },
        ];

        setProviders(type === "tv" ? tvProviders : mockProviders);
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [type]);

  useEffect(() => {
    if (!formData.service_id) return;

    const fetchVariations = async () => {
      setLoading(true);
      try {
        const mockVariations: Variation[] =
          type === "data"
            ? [
                {
                  variation_id: "1",
                  service_id: formData.service_id,
                  service_name: " 1 Day",
                  price: "100",
                  data_plan: "100MB ",
                },
                {
                  variation_id: "2",
                  service_id: formData.service_id,
                  service_name: "7 Days",
                  price: "500",
                  data_plan: "1GB",
                },
                {
                  variation_id: "3",
                  service_id: formData.service_id,
                  service_name: "30 Days",
                  price: "2000",
                  data_plan: "5GB",
                },
                {
                  variation_id: "4",
                  service_id: formData.service_id,
                  service_name: "30 Days",
                  price: "2000",
                  data_plan: "5GB",
                },
                {
                  variation_id: "5",
                  service_id: formData.service_id,
                  service_name: "30 Days",
                  price: "2000",
                  data_plan: "5GB",
                },
                {
                  variation_id: "6",
                  service_id: formData.service_id,
                  service_name: "30 Days",
                  price: "2000",
                  data_plan: "5GB",
                },
              ]
            : [
                {
                  variation_id: "1",
                  service_id: formData.service_id,
                  service_name: "DStv Yanga",
                  price: "4000",
                  package_bouquet: "DStv Yanga - Entertainment",
                },
                {
                  variation_id: "2",
                  service_id: formData.service_id,
                  service_name: "DStv Compact",
                  price: "10500",
                  package_bouquet: "DStv Compact - Premium",
                },
                {
                  variation_id: "3",
                  service_id: formData.service_id,
                  service_name: "DStv Premium",
                  price: "24500",
                  package_bouquet: "DStv Premium - Ultimate",
                },
                {
                  variation_id: "4",
                  service_id: formData.service_id,
                  service_name: "DStv Premium",
                  price: "24500",
                  package_bouquet: "DStv Premium - Ultimate",
                },
                {
                  variation_id: "5",
                  service_id: formData.service_id,
                  service_name: "DStv Premium",
                  price: "24500",
                  package_bouquet: "DStv Premium - Ultimate",
                },
                {
                  variation_id: "6",
                  service_id: formData.service_id,
                  service_name: "DStv Premium",
                  price: "24500",
                  package_bouquet: "DStv Premium - Ultimate",
                },
              ];

        setVariations(mockVariations);
      } catch (error) {
        console.error("Failed to fetch variations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (config.showVariations) {
      fetchVariations();
    }
  }, [formData.service_id, type, config.showVariations]);

  const handleBack = () => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleNumberClick = (num: string) => {
    if (num === "←") {
      const lastFilledIndex = otp.reduce(
        (acc, digit, idx) => (digit ? idx : acc),
        -1
      );
      if (lastFilledIndex >= 0) {
        const newOtp = [...otp];
        newOtp[lastFilledIndex] = "";
        setOtp(newOtp);
      }
    } else if (num === "✓") {
      if (otp.every((d) => d)) {
        handleSubmit();
      }
    } else {
      const emptyIndex = otp.findIndex((digit) => !digit);
      if (emptyIndex !== -1) {
        const newOtp = [...otp];
        newOtp[emptyIndex] = num;
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create transaction data
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
        description:
          type === "data"
            ? "Data plan"
            : type === "airtime"
            ? "Airtime"
            : "TV Subscription",
        transactionId: `TRX${Date.now()}`,
        providerLogo:
          providers.find((p) => p.service_id === formData.service_id)?.logo ||
          "",
        providerName:
          providers.find((p) => p.service_id === formData.service_id)
            ?.service_name || "",
        planName:
          formData.variation?.data_plan ||
          formData.variation?.package_bouquet ||
          "",
      };

      setSuccess(true);
      setReference(transactionData.transactionId);
      setFormData((prev) => ({ ...prev, transactionData }));
      handleNext();
    } catch (error) {
      setSuccess(false);
      handleNext();
    } finally {
      setLoading(false);
    }
  };

  //   const handleReset = () => {
  //     setStep(1);
  //     setOtp(["", "", "", ""]);
  //     setSuccess(null);
  //     setFormData({
  //       service_id: "",
  //       amount: "",
  //       customer_id: "",
  //       variation: null,
  //     });
  //   };

  const isStep1Valid = () => {
    if (!formData.service_id) return false;
    if (!formData.customer_id) return false;

    if (config.showVariations && !formData.variation) return false;
    if (config.showAmountGrid && !formData.amount) return false;

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
            </div>

            <div className="space-y-6">
              <ProviderSelect
                providers={providers}
                value={formData.service_id}
                onChange={(service_id) =>
                  setFormData((prev) => ({ ...prev, service_id }))
                }
              />

              {config.showVariations && formData.service_id && (
                <VariationSelect
                  variations={variations}
                  value={formData.variation}
                  onSelect={(variation) =>
                    setFormData((prev) => ({
                      ...prev,
                      variation,
                      amount: variation.price,
                    }))
                  }
                  type={type}
                />
              )}

              {config.showAmountGrid && formData.service_id && (
                <AmountGrid
                  value={formData.amount}
                  onChange={(amount) =>
                    setFormData((prev) => ({ ...prev, amount }))
                  }
                  presetAmounts={presetAmounts}
                />
              )}

              {formData.service_id &&
                (config.showAmountGrid || formData.variation) && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">
                      {config.customerLabel}
                    </label>

                    <div className="w-full flex gap-3 items-center">
                      <div className="p-4 my-3 rounded-full bg-card">+234</div>
                      <TextInput
                        value={formData.customer_id}
                        onChange={(customer_id) =>
                          setFormData((prev) => ({ ...prev, customer_id }))
                        }
                        placeholder={config.placeholder}
                        type="tel"
                      />
                    </div>
                  </div>
                )}

              <Button
                onclick={handleNext}
                type="primary"
                text="Continue"
                width="w-full py-4"
                disabled={!isStep1Valid()}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 w-full h-full flex flex-col justify-end"
          >
            <div className="w-full bg-card py-5 rounded-t-3xl">
              <div className="space-y-1">
                <h2 className="text-xl font-black w-full text-center">
                  Summary
                </h2>
              </div>

              <div className="w-full rounded-2xl p-6 space-y-4">
                <div className="flex w-full  justify-between items-center max-w-md mx-auto">
                  <span className="text-xl font-black w-full">
                    ₦{parseInt(formData.amount || "0").toLocaleString()}
                  </span>
                  <Image
                    src={"/svg/leftRight.svg"}
                    alt="swap arrow"
                    width={30}
                    height={30}
                    className=""
                  />
                  <span className="font-black w-full text-end">
                    {formData.variation?.data_plan ||
                      formData.variation?.package_bouquet}
                  </span>
                </div>

                <div className="space-y-3">
                  <ReviewItem label="Product" value={type.toUpperCase()} />
                  <ReviewItem
                    label={type === "tv" ? "Provider" : "Network"}
                    value={
                      providers.find(
                        (p) => p.service_id === formData.service_id
                      )?.service_name || ""
                    }
                  />
                  <ReviewItem
                    label={config.customerLabel}
                    value={formData.customer_id}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onclick={handleBack}
                  type="card"
                  text="Back"
                  width="flex-1 py-4"
                />
                <Button
                  onclick={handleNext}
                  type="primary"
                  text="Confirm & Pay"
                  width="flex-1 py-4"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 bg-card/50 absolute top-0 "
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black">Enter Your PIN</h2>
              <p className="text-lg">
                To complete this transaction, please enter your 4-digit PIN
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              {otp.map((digit, index) => (
                <motion.div
                  key={index}
                  animate={{ scale: digit ? 1.1 : 1 }}
                  className={`w-15 h-15 rounded-full flex items-center justify-center text-xl font-semibold ${
                    showOTPFull
                      ? ""
                      : digit
                      ? "bg-primary"
                      : "bg-card"
                  }`}
                >
                  {showOTPFull ? digit || "" : digit ? "•" : ""}
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => !showOTPFull}
              className="flex items-center justify-center gap-2 mx-auto mb-6 text-sm hover:text-stone-800"
            >
              {showOTPFull ? <EyeOff size={18} /> : <Eye size={18} />}
              {showOTPFull ? "Hide" : "Show"} PIN
            </button>

            <Keypad
              numbers={[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "✓",
                "0",
                "←",
              ]}
              onNumberClick={handleNumberClick}
              onDelete={() => handleNumberClick("←")}
              onConfirm={() => handleNumberClick("✓")}
              disableConfirm={!otp.every((d) => d)}
              loading={loading}
            />
          </motion.div>
        );

      case 4:
        return (
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 text-center bg-card rounded-2xl px-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto"
              >
                {success ? (
                  <Check size={40} className="" />
                ) : (
                  <X size={40} className="" />
                )}
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black">
                  {success ? "Transaction Successful" : "Transaction Failed"}
                </h2>
                <p className="text-lg">
                  {success
                    ? "Your transaction has been processed successfully"
                    : "Something went wrong. Please try again."}
                </p>
                <div className="flex flex-col gap-2">
                  <span>Amount Sent</span>
                  <span className="font-black text-2xl">
                    ₦{parseInt(formData.amount).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-4 my-5 max-w-sm mx-auto">
                  <h5 className="text-center text-sm">Beneficiary</h5>
                  <div className="w-full flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <Image
                        src={formData.transactionData?.providerLogo || ""}
                        alt="service provider"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>{formData.customer_id}</div>
                    </div>
                    <ArrowRight size={24} className="placeholder-text" />
                  </div>
                </div>
              </div>

              {success && formData.transactionData && (
                <div className="w-full rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Date & Time</span>
                    <span className="font-medium">
                      {formData.transactionData.dateTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment method</span>
                    <span className="font-mono text-sm">
                      {formData.transactionData.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="font-mono text-sm">
                      {formData.transactionData.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Description</span>
                    <span className="font-mono text-sm">
                      {formData.transactionData.description}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID</span>
                    <span className="font-mono text-sm">
                      {formData.transactionData.transactionId}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
            <div className="w-full flex gap-6">
              <button className="w-full py-4 px-5 rounded-full bg-card">
                Share as image
              </button>
              <button className="w-full py-4 px-5 rounded-full bg-card">
                Share as PDF
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full mx-auto max-w-xl  min-h-200">
      {/* Content */}
      <div className="p-4 relative">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>
    </div>
  );
}

// Sub-components
interface ProviderSelectProps {
  providers: Provider[];
  value: string;
  onChange: (service_id: string) => void;
}

function ProviderSelect({ providers, value, onChange }: ProviderSelectProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {providers.map((provider) => (
          <div
            key={provider.service_id}
            className={` rounded-2xl p-0.5 ${
              value === provider.service_id
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "bg-card"
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(provider.service_id)}
              className={`flex flex-col items-center w-full rounded-2xl overflow-hidden transition-all bg-card`}
            >
              <div className="w-full h-auto mb-2 flex items-center justify-center">
                  <div className="w-full h-20 relative rounded-lg overflow-hidden">
                    <Image
                      src={provider.logo}
                      alt={provider.service_name}
                      fill
                      className="object-cover"
                    />
                  </div>
              </div>
              <span className="text-sm font-medium py-1 text-center">
                {provider.service_name}
              </span>
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface VariationSelectProps {
  variations: Variation[];
  value: Variation | null;
  onSelect: (variation: Variation) => void;
  type: PurchaseType;
}

function VariationSelect({
  variations,
  value,
  onSelect,
  type,
}: VariationSelectProps) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold">
        Select {type === "tv" ? "Package" : "Data Plan"}
      </label>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {variations.map((variation) => (
          <div
            key={variation.variation_id}
            className={` rounded-2xl p-0.5 ${
              value?.variation_id === variation.variation_id
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "bg-card"
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(variation)}
              className={`w-full p-4 rounded-2xl text-left transition-all bg-card
            `}
            >
              <div className="flex flex-col  justify-between items-center">
                <div>
                  <h4 className="font-black text-center">
                    {type === "tv"
                      ? variation.package_bouquet
                      : variation.data_plan}
                  </h4>
                  <p className="text-sm text-center">
                    {variation.service_name}
                  </p>
                </div>
                <span className="text-center text-lg">
                  ₦{parseInt(variation.price).toLocaleString()}
                </span>
              </div>
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AmountGridProps {
  value: string;
  onChange: (value: string) => void;
  presetAmounts: number[];
}

function AmountGrid({ value, onChange, presetAmounts }: AmountGridProps) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold">Amount</label>
      <div className="grid grid-cols-3 gap-3">
        {presetAmounts.map((amount) => (
          <motion.button
            key={amount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(amount.toString())}
            className={`p-4 rounded-2xl transition-all ${
              value === amount.toString()
                ? "bg-primary/10 font-black"
                : "bg-card"
            }`}
          >
            ₦{amount.toLocaleString()}
          </motion.button>
        ))}
      </div>

      <TextInput
        value={value}
        onChange={onChange}
        placeholder="Custom amount"
        type="number"
        currency="₦"
      />
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 last:border-b-0">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}





export function Keypad({
    numbers,
    onNumberClick,
    onDelete,
    onConfirm,
    disableConfirm,
    loading,
    step
}: {
    numbers: string[];
    onNumberClick: (num: string) => void;
    onDelete: () => void;
    onConfirm: () => void;
    disableConfirm: boolean;
    loading: boolean;
    step?: number
}) {
    return (
        <div className="grid grid-cols-3 gap-3 mx-auto sm:w-90 justify-center items-center">
            {numbers.map((num, idx) => {
                if (num === "←") {
                    return (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.9 }}
                            onClick={onDelete}
                            className="text-lg w-20 h-20 rounded-full bg-background font-semibold mx-auto hover:border-border transition-all shadow-sm flex items-center justify-center"
                        >
                            ⌫
                        </motion.button>
                    );
                } else if (num === "✓") {
                    return (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.95 }}
                            onClick={onConfirm}
                            disabled={disableConfirm || loading}
                            className={`text-lg w-20 h-20 rounded-full font-semibold mx-auto border-border  transition-all shadow-sm flex items-center justify-center ${disableConfirm || loading
                                ? "bg-background text-stone-400 cursor-not-allowed"
                                : "bg-primary shadow-md"
                                }`}
                        >
                            <Fingerprint size={36} />
                        </motion.button>
                    );
                } else if (num === "#" && step) {
                    return (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.95 }}
                            onClick={onConfirm}
                            disabled={disableConfirm || loading}
                            className={`text-lg w-20 h-20 rounded-full font-semibold mx-auto   transition-all shadow-sm flex items-center justify-center ${disableConfirm || loading
                                ? "bg-background text-stone-400 cursor-not-allowed"
                                : "bg-primary shadow-md"
                                }`}
                        >
                            {step == 1 ? <ArrowRight size={36} /> : <Check size={36} />}
                        </motion.button>
                    );
                }
                else {
                    return (
                        <motion.button
                            key={idx}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNumberClick(num)}
                            className="text-lg w-20 h-20 rounded-full bg-card font-semibold mx-auto hover:border-border transition-all shadow-sm"
                        >
                            {num}
                        </motion.button>
                    );
                }
            })}
        </div>
    );
}




interface ButtonProps {
  type?:
    | "primary"
    | "secondary"
    | "blue"
    | "orange"
    | "purple"
    | "card"
    | undefined;
  width?: string;
  text?: string;
  children?: React.ReactNode;
  onclick?: React.MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  disabled?: boolean;
  href?: string;
}

export function Button({
  type,
  width = "w-full",
  text,
  onclick,
  children,
  loading,
  disabled = false,
  href,
}: ButtonProps): React.JSX.Element {
  const buttonClasses = `
    ${width} 
    ${type === "primary"
      ? "bg-primary"
      : type === "secondary"
      ? "primary-orange-to-purple"
      : type === "blue"
      ? "bg-blue"
      : type === "orange"
      ? "bg-orange"
      : type === "purple"
      ? "bg-purple"
      : type === "card"
      ? "bg-card"
      : "bg-transparent"
    } 
    cursor-pointer
    py-3 
    rounded-3xl 
    text-white 
    font-bold 
    text-lg 
    relative 
    ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
  `.replace(/\s+/g, ' ').trim();

  const LoadingOverlay = () => (
    <span className="absolute top-0 w-full bg-black/50 rounded-3xl left-0 h-full flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </span>
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={`${buttonClasses} text-center`} >
        {text || children}
      </Link>
    );
  }

  return (
    <button
      onClick={onclick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {text || children}
      {(loading || disabled) && <LoadingOverlay />}
    </button>
  );
}