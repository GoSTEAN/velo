"use client";

import { Card } from "@/components/ui/Card";
import { ChevronDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCodeLib from "qrcode";
import Image from "next/image";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { usePaymentMonitor } from "@/components/hooks/usePaymentMonitor";
import { QRCodeDisplay } from "@/components/modals/qr-code-display";

// Utility function to normalize Starknet addresses
const normalizeStarknetAddress = (address: string, chain: string): string => {
  if (chain.toLowerCase() === "starknet" || chain.toLowerCase() === "strk") {
    if (address.startsWith("0x") && !address.startsWith("0x0")) {
      return address.replace("0x", "0x0");
    }
  }
  return address;
};

// Generate proper URI schemes for different cryptocurrencies
const generateCryptoURI = (chain: string, address: string, amount: string, token: string): string => {
  const normalizedAmount = amount === "0" ? "0" : amount;
  
  switch (chain.toLowerCase()) {
    case 'ethereum':
    case 'eth':
    case 'usdt_erc20':
      // EIP-681 format for Ethereum and ERC20 tokens
      return `ethereum:${address}?value=${normalizedAmount}`;
    
    case 'starknet':
    case 'strk':
    case 'usdt':
    case 'usdc':
      // Starknet uses similar format to Ethereum
      return `starknet:${address}?value=${normalizedAmount}`;
    
    case 'bitcoin':
    case 'btc':
      // BIP-21 format for Bitcoin
      return `bitcoin:${address}?amount=${normalizedAmount}`;
    
    case 'solana':
    case 'sol':
      // Solana URI scheme
      return `solana:${address}?amount=${normalizedAmount}`;
    
    default:
      // Fallback: just the address
      return address;
  }
};

export default function QrPayment() {
  const [token, setToken] = useState("STRK");
  const [amount, setAmount] = useState("");
  const [tokenWei, setTokenWei] = useState<bigint>(BigInt(0));
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addresses, loading: addressesLoading } = useWalletAddresses();

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setLoading(false);
    } else if (!addressesLoading) {
      setLoading(false);
    }
  }, [addresses, addressesLoading]);

  const STARKNET_TOKEN_ADDRESSES = useMemo(
    () => ({
      USDT: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
      USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
      STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    }),
    []
  );

  const getDecimals = (selectedToken: string): number => {
    return selectedToken === "STRK" || selectedToken === "ETH" ? 18 : 6;
  };

  const getReceiverAddress = useCallback((): string => {
    if (!addresses || addresses.length === 0) return "";

    if (["USDT", "USDC", "STRK"].includes(token)) {
      const starknetAddr = addresses[3]?.address || "";
      return normalizeStarknetAddress(
        starknetAddr,
        addresses[3]?.chain || "STRK"
      );
    }

    const addressMap: { [key: string]: number } = {
      ETH: 0,
      BTC: 1,
      SOL: 2,
    };

    const index = addressMap[token];
    if (index !== undefined && addresses[index]) {
      return normalizeStarknetAddress(
        addresses[index].address,
        addresses[index].chain
      );
    }

    return "";
  }, [addresses, token]);

  const getTokenChain = useCallback((): string => {
    const chainMap: { [key: string]: string } = {
      ETH: "ethereum",
      BTC: "bitcoin", 
      SOL: "solana",
      STRK: "starknet",
      USDT: "starknet",
      USDC: "starknet",
    };
    return chainMap[token] || "ethereum";
  }, [token]);

  const getTokenAddress = useCallback((): string => {
    if (
      STARKNET_TOKEN_ADDRESSES[token as keyof typeof STARKNET_TOKEN_ADDRESSES]
    ) {
      return STARKNET_TOKEN_ADDRESSES[
        token as keyof typeof STARKNET_TOKEN_ADDRESSES
      ];
    }
    return getReceiverAddress();
  }, [token, STARKNET_TOKEN_ADDRESSES, getReceiverAddress]);

  const currentReceiverAddress = getReceiverAddress();
  const currentTokenAddress = getTokenAddress();
  const currentChain = getTokenChain();

  const { paymentStatus, error } = usePaymentMonitor({
    expectedAmount: tokenWei,
    receiverAddress: currentReceiverAddress,
    tokenAddress: currentTokenAddress,
    enabled: !!qrData && !!currentReceiverAddress && !!currentTokenAddress,
    pollInterval: 10000,
  });

  const { rates, isLoading: ratesLoading } = useExchangeRates();

  useEffect(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setTokenWei(BigInt(0));
      return;
    }

    const tokenPriceInNGN = rates[token as keyof typeof rates];
    if (!tokenPriceInNGN) {
      setTokenWei(BigInt(0));
      return;
    }

    const ngnAmount = Number.parseFloat(amount);
    const tokenAmount = ngnAmount / tokenPriceInNGN;
    const decimals = getDecimals(token);
    const amountInWei = BigInt(Math.floor(tokenAmount * 10 ** decimals * 1));
    setTokenWei(amountInWei);
  }, [amount, token, rates]);

  const calculateTokenAmount = useCallback(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return "0";
    }

    if (ratesLoading && !rates[token as keyof typeof rates]) {
      return "Loading...";
    }

    const ngnAmount = Number.parseFloat(amount);
    const tokenPriceInNGN = rates[token as keyof typeof rates] || 1;
    const tokenAmount = ngnAmount / tokenPriceInNGN;
    const displayDecimals = getDecimals(token) === 18 ? 6 : 9;

    return tokenAmount.toFixed(displayDecimals);
  }, [amount, token, rates, ratesLoading]);

  const handleGenerateQR = useCallback(async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!currentReceiverAddress) {
      alert("Receiver address not available. Please ensure wallet addresses are loaded.");
      return;
    }

    if (tokenWei === 0n) {
      alert("Invalid token amount calculation");
      return;
    }

    setIsProcessing(true);

    try {
      const tokenAmount = calculateTokenAmount();
      
      // Generate proper cryptocurrency URI for QR code
      const cryptoURI = generateCryptoURI(currentChain, currentReceiverAddress, tokenAmount, token);
      
      console.log("Generating QR for:", {
        chain: currentChain,
        address: currentReceiverAddress,
        amount: tokenAmount,
        token: token,
        uri: cryptoURI
      });

      // Generate QR code with the proper cryptocurrency URI
      const qrCodeDataUrl = await QRCodeLib.toDataURL(cryptoURI, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: 'M'
      });

      setQrData(qrCodeDataUrl);
      setShowQR(true);
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to create payment request");
    } finally {
      setIsProcessing(false);
    }
  }, [amount, currentReceiverAddress, currentChain, token, tokenWei, calculateTokenAmount]);

  const handleTokenSelect = useCallback((tkn: string) => {
    setToken(tkn);
    setShowTokenDropdown(false);
  }, []);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*\.?\d*$/.test(value)) {
        setAmount(value);
      }
    },
    []
  );

  const handleCloseQR = useCallback(() => {
    setShowQR(false);
    setQrData("");
    setTokenWei(0n);
  }, []);

  const tokens = ["USDT", "USDC", "STRK", "ETH", "BTC", "SOL"];

  useEffect(() => {
    const handleClickOutside = () => {
      if (showTokenDropdown) {
        setShowTokenDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showTokenDropdown]);

  const steps = [
    {
      step: "Create Payment Request",
      description: "Enter Amount And Select Currency To Create Payment Request",
    },
    {
      step: "Generate QR Code",
      description: "QR code is generated after payment request is created",
    },
    {
      step: "Customer Scans",
      description: "Customer Uses Wallet To Scan QR Code",
    },
    {
      step: "Payment Confirmed",
      description: "Transaction Is Processed And Confirmed Automatically",
    },
  ];

  if (loading || addressesLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading wallet addresses...</p>
        </div>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center gap-4 max-w-md">
          <h2 className="text-xl font-bold text-foreground">No Wallet Addresses</h2>
          <p className="text-muted-foreground text-center">
            Unable to retrieve wallet addresses. Please check your connection and try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-all duration-300 p-6">
      {/* Header */}
      <div className="space-y-3 mb-8 text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          QR Payment Generator
        </h1>
        <p className="text-muted-foreground text-pretty text-lg">
          Create payment requests and generate QR codes for customers
        </p>
      </div>

      <div className="grid gap-6 mx-auto w-fit">
        {/* Payment Form */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative z-20 p-6">
          <div className="flex flex-col gap-6">
            {/* Amount Input */}
            <div className="flex flex-col gap-3">
              <label htmlFor="amount" className="text-foreground text-sm font-medium">
                Payment Amount (NGN)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="amount"
                  placeholder="300"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                  ≈ {calculateTokenAmount()} {token}
                </div>
              </div>
            </div>

            {/* Token Selector */}
            <div className="flex flex-col gap-3 relative">
              <label className="text-foreground text-sm font-medium">
                Select Currency
              </label>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTokenDropdown(!showTokenDropdown);
                }}
                className="w-full flex p-3 items-center justify-between rounded-lg bg-background border border-border cursor-pointer hover:border-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-card flex items-center justify-center">
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
                  <span className="text-foreground font-medium">{token}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${
                    showTokenDropdown ? "rotate-180" : ""
                  }`}
                />
              </div>

              {showTokenDropdown && (
                <Card className="w-full absolute top-full flex flex-col pt-20 text-muted-foreground left-0 z-50 mt-1 shadow-lg border border-border max-h-60 overflow-y-scroll">
                  {tokens.map((tkn, id) => (
                    <button
                      key={id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTokenSelect(tkn);
                      }}
                      className={`w-full rounded-md flex items-center gap-3 p-3 text-left hover:bg-hover hover:text-white transition-colors ${
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

            {/* Generate Button */}
            <button
              onClick={handleGenerateQR}
              disabled={isProcessing || tokenWei === 0n || ratesLoading || !currentReceiverAddress}
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
          paymentStatus={paymentStatus}
          error={error}
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