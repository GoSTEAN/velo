"use client";

import { Card } from "@/components/ui/Card";
import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import QRCodeLib from "qrcode";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { QRCodeDisplay } from "@/components/modals/qr-code-display";
import { useAuth } from "@/components/context/AuthContext";
import { address } from "bitcoinjs-lib";
import {AddressDropdown} from "@/components/modals/addressDropDown";

// Utility function to normalize Starknet addresses
const normalizeStarknetAddress = (address: string, chain: string): string => {
  if (chain.toLowerCase() === "starknet" || chain.toLowerCase() === "strk") {
    if (address.startsWith("0x") && !address.startsWith("0x0")) {
      return address.replace("0x", "0x0");
    }
  }
  return address;
};

// QR code format generators for different cryptocurrencies
const generateQRData = (
  chain: string,
  address: string,
  amount: string | null = null,
  label: string | null = null
): string => {
  switch (chain.toLowerCase()) {
    case "bitcoin":
    case "btc":
      let bitcoinUri = `bitcoin:${address}`;
      const bitcoinParams = [];
      if (amount) bitcoinParams.push(`amount=${amount}`);
      if (label) bitcoinParams.push(`label=${encodeURIComponent(label)}`);
      if (bitcoinParams.length > 0) {
        bitcoinUri += `?${bitcoinParams.join("&")}`;
      }
      return bitcoinUri;

    case "ethereum":
    case "eth":
      let ethereumUri = `ethereum:${address}`;
      const ethereumParams = [];
      if (amount) {
        const weiAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
        ethereumParams.push(`value=${weiAmount}`);
      }
      if (label) ethereumParams.push(`label=${encodeURIComponent(label)}`);
      if (ethereumParams.length > 0) {
        ethereumUri += `?${ethereumParams.join("&")}`;
      }
      return ethereumUri;

    case "solana":
    case "sol":
      let solanaUri = `solana:${address}`;
      const solanaParams = [];
      if (amount) solanaParams.push(`amount=${amount}`);
      if (label) solanaParams.push(`label=${encodeURIComponent(label)}`);
      if (solanaParams.length > 0) {
        solanaUri += `?${solanaParams.join("&")}`;
      }
      return solanaUri;

    case "starknet":
    case "strk":
      let starknetUri = `starknet:${address}`;
      const starknetParams = [];
      if (amount) {
        const weiAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
        starknetParams.push(`value=${weiAmount}`);
      }
      if (label) starknetParams.push(`label=${encodeURIComponent(label)}`);
      if (starknetParams.length > 0) {
        starknetUri += `?${starknetParams.join("&")}`;
      }
      return starknetUri;

    case "usdt_erc20":
      return `ethereum:${address}`;
    case "usdt_trc20":
      return `tron:${address}`;

    default:
      return address;
  }
};

// Enhanced QR code generation function
const generateCompatibleQRCode = async (
  chain: string,
  address: string,
  options: {
    amount?: string | null;
    label?: string | null;
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  } = {}
) => {
  const {
    amount = null,
    label = null,
    width = 200,
    margin = 2,
    darkColor = "#000000",
    lightColor = "#FFFFFF",
    errorCorrectionLevel = "M",
  } = options;

  try {
    const qrData = generateQRData(chain, address, amount, label);
    const qrCodeDataUrl = await QRCodeLib.toDataURL(qrData, {
      width,
      margin,
      errorCorrectionLevel,
      type: "image/png" as "image/png" | "image/jpeg" | "image/webp",
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });

    return {
      dataUrl: qrCodeDataUrl,
      rawData: qrData,
      format: getQRFormat(chain),
    };
  } catch (error) {
    console.error("Error generating compatible QR code:", error);
    throw error;
  }
};

// Helper function to get the format description
const getQRFormat = (chain: string): string => {
  switch (chain.toLowerCase()) {
    case "bitcoin":
    case "btc":
      return "BIP21 Bitcoin URI";
    case "ethereum":
    case "eth":
      return "EIP681 Ethereum URI";
    case "solana":
    case "sol":
      return "Solana URI Scheme";
    case "starknet":
    case "strk":
      return "Ethereum-compatible URI";
    case "usdt_erc20":
      return "ERC-20 Token URI";
    case "usdt_trc20":
      return "TRC-20 Token URI";
    default:
      return "Plain Address";
  }
};

export default function QrPayment() {
  const [token, setToken] = useState("STARKNET");
  const [amount, setAmount] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [description, setDescription] = useState("");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("");

  console.log("amount", amount);

  const tokenRate = (token: string) => {
    if (token === "ETHEREUM") return "ETH";
    if (token === "BITCOIN") return "BTC";
    if (token === "SOLANA") return "SOL";
    if (token === "STARKNET") return "STRK";
    if (token === "USDT_TRC20") return "USDT";
    if (token === "USDT_ERC20") return "USDT";
    return "USDT";
  };
  const { addresses, loading: addressesLoading } = useWalletAddresses();
  const { rates, isLoading: ratesLoading } = useExchangeRates();
  const { createMerchantPayment, user } = useAuth();
  console.log("All addresses", addresses);
  const tokens = useMemo(
    () => [
      "ETHEREUM",
      "BITCOIN",
      "SOLANA",
      "STARKNET",
      "USDT_TRC20",
      "USDT_ERC20",
    ],
    []
  );

  const getTokenChain = useCallback((): string => {
    const chainMap: { [key: string]: string } = {
      ETHEREUM: "ethereum",
      BITCOIN: "bitcoin",
      SOLANA: "solana",
      STARKNET: "starknet",
      USDT_ERC20: "usdt_erc20",
      USDT_TRC20: "usdt_trc20",
    };
    return chainMap[token] || "ethereum";
  }, [token]);

  const singleAddress = addresses.filter(
    (a) => a.chain === token.toLowerCase()
  );
  console.log("single address", singleAddress);

  const currentReceiverAddress = useMemo((): string => {
    if (!addresses || addresses.length === 0) return "";

    const chain = getTokenChain();
    const addr = addresses.find((a) => a.chain === chain);
    if (!addr) return "";

    return normalizeStarknetAddress(addr.address, chain);
  }, [addresses, getTokenChain]);

  const calculateTokenAmount = useCallback((): string => {
    const ngnAmount = parseFloat(amount) || 0;
    const rateKey = tokenRate(token);
    const rate = rateKey ? rates[rateKey] : 1;

    if (!rate || rate === 0) {
      console.log("Using fallback rate for calculation");
      return (ngnAmount / 1500).toFixed(6);
    }

    const tokenAmount = ngnAmount / rate;

    return tokenAmount.toFixed(6);
  }, [amount, rates, token]);

  const handleTokenSelect = (tkn: string) => {
    setToken(tkn);
    setShowTokenDropdown(false);
  };

  const handleCreatePaymentRequest = async () => {
    if (!amount || !currentReceiverAddress) {
      setLocalError(
        "Please enter an amount and ensure wallet address is available"
      );
      return;
    }

    setIsProcessing(true);
    setLocalError(null);

    try {
      const tokenAmount = calculateTokenAmount();
      const chain = getTokenChain();
      const network = addresses.find((a) => a);

      if (!network) return "";

      const qrResult = await generateCompatibleQRCode(
        chain,
        currentReceiverAddress,
        {
          amount: tokenAmount,
          width: 200,
          margin: 2,
          errorCorrectionLevel: "M",
        }
      );
      const requestBody: any = {
        amount: parseFloat(tokenAmount),
        chain: chain,
        network: "testnet",
        description: description || "QR Payment request",
      };

      switch (chain.toLowerCase()) {
        case "bitcoin":
          requestBody.btcAddress = currentReceiverAddress;
          break;
        case "ethereum":
          requestBody.ethAddress = currentReceiverAddress;
          break;
        case "solana":
          requestBody.solAddress = currentReceiverAddress;
          break;
        case "starknet":
          requestBody.strkAddress = currentReceiverAddress;
          break;
        case "usdt_erc20":
          requestBody.usdtErc20Address = currentReceiverAddress;
          break;
        case "usdt_trc20":
          requestBody.usdtTrc20Address = currentReceiverAddress;
          break;
        default:
          requestBody.address = currentReceiverAddress;
      }

      console.log(" Sending request body:", requestBody);

      const response = await createMerchantPayment(requestBody);

      console.log(" Received response:", response);

      if (response && response.payment) {
        setPaymentId(response.payment.id || "");
        setPaymentStatus(response.payment.status);
        setQrData(qrResult.dataUrl);
        setShowQR(true);
        console.log(" Payment created with ID:", response.payment.id);
        console.log(" Payment status:", response.payment.status);
      } else {
        throw new Error("Invalid response from server - no payment data");
      }
    } catch (error: any) {
      console.error(" Error creating payment request:", error);
      setLocalError(error.message || "Failed to create payment request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseQR = () => {
    setShowQR(false);
    setQrData("");
    setPaymentId("");
    setLocalError(null);
    setAmount("");
  };

  const steps = [
    {
      step: "Enter Amount",
      description: "Specify the amount in NGN you want to receive",
    },
    {
      step: "Generate QR",
      description: "Create a unique payment request QR code",
    },
    {
      step: "Share QR",
      description: "Send the QR code or address to the payer",
    },
    {
      step: "Receive Payment",
      description: "Funds will be credited after confirmation",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50 flex-col backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Create Payment Request
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Token Selection */}
              <AddressDropdown
                selectedToken={token}
                onTokenSelect={handleTokenSelect}
                showBalance={true}
                showNetwork={false}
                showAddress={true}
                disabled={loading || ratesLoading || isProcessing}
              />
              {/* Amount Input */}
              <div>
                <label
                  htmlFor="amount"
                  className="text-foreground text-sm font-medium block mb-2"
                >
                  Amount (NGN)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in NGN"
                  className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  min="0"
                  step="any"
                  disabled={loading || ratesLoading || isProcessing}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {calculateTokenAmount()} {token}
                </p>
              </div>
              <div>
                <label
                  htmlFor="desc"
                  className="text-foreground text-sm font-medium block mb-2"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the payment purpose"
                  className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  min="0"
                  step="any"
                  disabled={loading || ratesLoading || isProcessing}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="text-foreground text-sm font-medium block mb-2"
                >
                  Customer email
                </label>
                <input
                  type="text"
                  id="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter customer email"
                  className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  min="0"
                  step="any"
                  disabled={loading || ratesLoading || isProcessing}
                />
              </div>
            </div>

            {/* Error Message */}
            {localError && !showQR && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-600">{localError}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleCreatePaymentRequest}
              disabled={
                isProcessing ||
                !amount ||
                ratesLoading ||
                !currentReceiverAddress
              }
              className="w-full p-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isProcessing ? "Creating..." : "Create Payment Request"}
            </button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="border-border/50 bg-card/50 flex-col relative -z-10 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            How to Accept Payments
          </h2>
          <div className="space-y-4">
            {steps.map((step, id) => (
              <div key={id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">
                    {id + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{step.step}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeDisplay
          qrData={qrData}
          error={localError}
          amount={amount}
          token={token}
          calculatedAmount={calculateTokenAmount()}
          receiverAddress={currentReceiverAddress}
          paymentId={paymentId}
          onClose={handleCloseQR}
          paymentStatus={paymentStatus}
        />
      )}
    </div>
  );
}
