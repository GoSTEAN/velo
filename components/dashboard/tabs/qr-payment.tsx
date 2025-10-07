"use client";

import { Card } from "@/components/ui/Card";
import { ChevronDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import QRCodeLib from "qrcode";
import Image from "next/image";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { QRCodeDisplay } from "@/components/modals/qr-code-display";
import { useAuth } from "@/components/context/AuthContext";

// Utility function to normalize Starknet addresses
const normalizeStarknetAddress = (address: string, chain: string): string => {
  if (chain.toLowerCase() === "starknet" || chain.toLowerCase() === "strk") {
    if (address.startsWith("0x") && !address.startsWith("0x0")) {
      return address.replace("0x", "0x0");
    }
  }
  return address;
};

export default function QrPayment() {
  const [token, setToken] = useState("STRK");
  const [amount, setAmount] = useState("");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentId, setPaymentId] = useState<string>("");
  const [localPaymentStatus, setLocalPaymentStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [localError, setLocalError] = useState<string | null>(null);

  const { addresses, loading: addressesLoading } = useWalletAddresses();
  const { rates, isLoading: ratesLoading, lastUpdated } = useExchangeRates();
  const { generateQRCode, getQRPaymentStatus } = useAuth();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setLoading(false);
    } else if (!addressesLoading) {
      setLoading(false);
    }
  }, [addresses, addressesLoading]);

  const tokens = useMemo(() => ["ETH", "BTC", "SOL", "STRK"], []);

  const getTokenChain = useCallback((): string => {
    const chainMap: { [key: string]: string } = {
      ETH: "ethereum",
      BTC: "bitcoin",
      SOL: "solana",
      STRK: "starknet",
    };
    return chainMap[token] || "ethereum";
  }, [token]);

  const currentReceiverAddress = useMemo((): string => {
    if (!addresses || addresses.length === 0) return "";

    const chain = getTokenChain();
    const addr = addresses.find(a => a.chain === chain);
    if (!addr) return "";

    return normalizeStarknetAddress(addr.address, chain);
  }, [addresses, getTokenChain]);

  const calculateTokenAmount = useCallback((): string => {
    const ngnAmount = parseFloat(amount) || 0;
    const rate = rates[token] || 1;
    const tokenAmount = ngnAmount / rate;
    return tokenAmount.toFixed(6);
  }, [amount, rates, token]);

  const handleGenerateQR = async () => {
    if (!currentReceiverAddress) return;

    setIsProcessing(true);
    try {
      const cryptoAmount = calculateTokenAmount();

      const request = {
        chain: getTokenChain(),
        network: "testnet",
        amount: cryptoAmount,
        description: "Payment request",
        expiresInMinutes: 30,
      };

      const response = await generateQRCode(request);

      const qrImage = await QRCodeLib.toDataURL(response.qrCodeString, {
        width: 300,
        margin: 1,
      });

      setQrData(qrImage);
      setPaymentId(response.qrData.paymentId);
      setShowQR(true);
      setLocalPaymentStatus("pending");
    } catch (error) {
      console.error("Error generating QR:", error);
      // Handle error, perhaps show toast
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!showQR || !paymentId) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const statusResponse = await getQRPaymentStatus(paymentId);
        const { paymentStatus } = statusResponse;

        if (paymentStatus.status === "confirmed" || paymentStatus.status === "completed") {
          setLocalPaymentStatus("success");
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (paymentStatus.isExpired) {
          setLocalPaymentStatus("error");
          setLocalError("Payment request has expired");
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else {
          setLocalPaymentStatus("pending");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    pollStatus(); // Initial check
    pollingRef.current = setInterval(pollStatus, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [showQR, paymentId, getQRPaymentStatus]);

  const handleCloseQR = () => {
    setShowQR(false);
    setQrData("");
    setPaymentId("");
    setLocalPaymentStatus("idle");
    setLocalError(null);
  };

  const handleTokenSelect = (tkn: string) => {
    setToken(tkn);
    setShowTokenDropdown(false);
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
    <div className="w-full max-w-xl mx-auto p-4 space-y-6">
      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50 flex-col backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Create Payment Request
          </h2>

          <div className="space-y-6">
            {/* Token Selection */}
            <div className="relative">
              <label
                htmlFor="token"
                className="text-foreground text-sm font-medium block mb-2"
              >
                Select Currency
              </label>
              <button
                onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                className="w-full p-3 rounded-lg bg-background border border-border flex items-center justify-between hover:border-primary transition-colors"
                disabled={loading || ratesLoading}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                    <Image
                      src={`/${token.toLowerCase()}.svg`}
                      alt={token}
                      width={16}
                      height={16}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <span className="font-medium">{token}</span>
                </div>
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>

              {showTokenDropdown && (
                <Card className="absolute z-10 w-full flex-col mt-1 bg-background backdrop-blur-2xl border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {tokens.map((tkn) => (
                    <button
                      key={tkn}
                      onClick={() => handleTokenSelect(tkn)}
                      className={`w-full rounded-md flex items-center gap-3 p-3 z-10 relative  text-left hover:bg-hover hover:bg-hover hover:text-hover transition-colors ${
                        token === tkn ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                        <Image
                          src={`/${tkn.toLowerCase()}.svg`}
                          alt={tkn}
                          width={16}
                          height={16}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <span className="font-medium">{tkn}</span>
                    </button>
                  ))}
                </Card>
              )}
            </div>

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
                disabled={loading || ratesLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                ≈ {calculateTokenAmount()} {token}
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateQR}
              disabled={isProcessing || !amount || ratesLoading || !currentReceiverAddress}
              className="w-full p-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Creating Payment Request...
                </div>
              ) : (
                "Create Payment Request"
              )}
            </button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="border-border/50 bg-card/50 flex-col backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            How to Accept Payments
          </h2>
          <div className="space-y-4">
            {steps.map((step, id) => (
              <div key={id} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">{id + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{step.step}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{step.description}</p>
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
          paymentStatus={localPaymentStatus}
          error={localError}
          amount={amount}
          token={token}
          calculatedAmount={calculateTokenAmount()}
          receiverAddress={currentReceiverAddress}
          onClose={handleCloseQR}
        />
      )}
    </div>
  );
}