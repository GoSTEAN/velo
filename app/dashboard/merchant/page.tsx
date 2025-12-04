"use client";

import React, { useCallback, useMemo, useState } from "react";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { QRCodeDisplay } from "@/components/modals/qr-code-display";
import { useMerchantPayments } from "@/components/hooks/useMerchantPayments";
import { AddressDropdown } from "@/components/modals/addressDropDown";
import { useWalletData } from "@/components/hooks/useWalletData";

import { 
  generateCompatibleQRCode,
  getCurrencySymbol,
  supportsAmountInQR 
} from "@/lib/utils/qr-utils";
import { 
  getTokenRateKey,
  getTokenChain,
  formatBalance 
} from "@/lib/utils/token-utils";
import { CardContainer } from "@/components/ui/CardContainer";
import { StepsGuide } from "@/components/ui/StepsGuide";
import { ValidationError } from "@/components/modals/TransactionStatus";
import { AmountInput } from "@/components/ui/AmountInput";
import { LoadingState } from "@/components/ui/LoadingState";
import { normalizeStarknetAddress } from "@/components/lib/utils";

export default function QrPayment() {
  const [token, setToken] = useState("STARKNET");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  
  const { addresses } = useWalletData();
  const { rates, isLoading: ratesLoading } = useExchangeRates();
  const { createPayment, isLoading: merchantLoading } = useMerchantPayments();

  // Get the current wallet address for the selected token
  const currentReceiverAddress = useMemo((): string => {
    if (!addresses || addresses.length === 0) return "";

    const chain = getTokenChain(token);
    const addr = addresses.find((a) => a.chain === chain);
    if (!addr) return "";

    return normalizeStarknetAddress(addr.address, chain);
  }, [addresses, token]);

  // Calculate token amount based on NGN input
  const calculateTokenAmount = useCallback((): string => {
    const ngnAmount = parseFloat(amount) || 0;
    const rateKey = getTokenRateKey(token);
    const rate = rateKey ? rates[rateKey] : 1;

    if (!rate || rate === 0) {
      console.log("Using fallback rate for calculation");
      return (ngnAmount / 1500).toFixed(6);
    }

    const tokenAmount = ngnAmount / rate;
    return tokenAmount.toFixed(6);
  }, [amount, rates, token]);

  // Handle token selection
  const handleTokenSelect = (tkn: string) => {
    setToken(tkn.toUpperCase());
  };

  // Create payment request
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
      const chain = getTokenChain(token);

      // Use the new QR utility
      const qrResult = await generateCompatibleQRCode(
        chain,
        currentReceiverAddress,
        {
          amount: tokenAmount,
          width: 200,
          margin: 2,
          errorCorrectionLevel: "M" as const,
        }
      );

      // Prepare request body
      const requestBody = {
        amount: parseFloat(tokenAmount),
        chain,
        network: "mainnet" as const,
        description: description || "QR Payment request",
        ...getAddressFieldForChain(chain, currentReceiverAddress)
      };

      const response = await createPayment(requestBody);

      if (response?.payment) {
        setPaymentId(response.payment.id || "");
        setPaymentStatus(response.payment.status);
        setQrData(qrResult.dataUrl);
        setShowQR(true);
      } else {
        throw new Error("Invalid response from server - no payment data");
      }
    } catch (error: any) {
      console.error("Error creating payment request:", error);
      setLocalError(error.message || "Failed to create payment request");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to get the correct address field name for API
  const getAddressFieldForChain = (chain: string, address: string) => {
    const fieldMap: Record<string, Record<string, string>> = {
      bitcoin: { btcAddress: address },
      ethereum: { ethAddress: address },
      solana: { solAddress: address },
      starknet: { strkAddress: address },
      usdt_erc20: { usdtErc20Address: address },
      usdt_trc20: { usdtTrc20Address: address },
      polkadot: { dotAddress: address },
      stellar: { xmlAddress: address },
    };

    return fieldMap[chain] || { address };
  };

  // Close QR modal
  const handleCloseQR = () => {
    setShowQR(false);
    setQrData("");
    setPaymentId("");
    setLocalError(null);
    setAmount("");
  };

  // Steps for instructions
  const steps = [
    {
      title: "Enter Amount",
      description: "Specify the amount in NGN you want to receive",
    },
    {
      title: "Generate QR",
      description: "Create a unique payment request QR code",
    },
    {
      title: "Share QR",
      description: "Send the QR code or address to the payer",
    },
    {
      title: "Receive Payment",
      description: "Funds will be credited after confirmation",
    },
  ];

  // Check if form can be submitted
  const canSubmit = !isProcessing && 
                    amount && 
                    !ratesLoading && 
                    currentReceiverAddress;

  // Show loading state while addresses are loading
  if (addresses.length === 0) {
    return <LoadingState message="Loading wallet data..." />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <div className="space-y-6">
        {/* Main Card */}
        <CardContainer>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Create Payment Request
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token Selection */}
              <div>
                
                <AddressDropdown
                  selectedToken={token}
                  onTokenSelect={handleTokenSelect}
                  showBalance={true}
                  showNetwork={false}
                  showAddress={true}
                  disabled={merchantLoading || ratesLoading || isProcessing}
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-foreground text-sm font-medium block mb-2">
                  Amount (NGN)
                </label>
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  currency="NGN"
                  disabled={merchantLoading || ratesLoading || isProcessing}
                  placeholder="Enter amount in NGN"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {calculateTokenAmount()} {getCurrencySymbol(getTokenChain(token))}
                </p>
              </div>

              {/* Description Input */}
              <div>
                <label className="text-foreground text-sm font-medium block mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the payment purpose"
                  className="w-full p-3 rounded-lg bg-muted placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  disabled={merchantLoading || ratesLoading || isProcessing}
                />
              </div>

             
            </div>

            {/* Error Message */}
            {localError && !showQR && (
              <ValidationError error={localError} variant="danger" />
            )}

            {/* Generate Button */}
            <button
              onClick={handleCreatePaymentRequest}
              disabled={!canSubmit}
              className="w-full p-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isProcessing ? "Creating..." : "Create Payment Request"}
            </button>

            {/* Additional Info */}
            <div className="text-xs text-muted-foreground">
              <p>
                <strong>Note:</strong> QR code includes amount in {getCurrencySymbol(getTokenChain(token))}
                {supportsAmountInQR(getTokenChain(token)) 
                  ? " - compatible with most wallets"
                  : " - some wallets may not support amount display"
                }
              </p>
              {currentReceiverAddress && (
                <p className="mt-1">
                  Receiving address: {currentReceiverAddress.slice(0, 12)}...{currentReceiverAddress.slice(-6)}
                </p>
              )}
            </div>
          </div>
        </CardContainer>

        {/* Instructions Card */}
        <StepsGuide 
          steps={steps} 
          title="How to Accept Payments"
        />
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