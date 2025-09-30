"use client";

import type React from "react";

import { Card } from "@/components/ui/Card";
import { CheckCheck, Dot, TriangleAlert, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCodeLib from "qrcode";
import Image from "next/image";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { usePaymentMonitor } from "@/components/hooks/usePaymentMonitor";

// Utility function to normalize Starknet addresses
const normalizeStarknetAddress = (address: string, chain: string): string => {
  if (chain.toLowerCase() === "starknet" || chain.toLowerCase() === "strk") {
    // Check if address starts with 0x but doesn't have the required leading zero
    if (address.startsWith("0x") && !address.startsWith("0x0")) {
      return address.replace("0x", "0x0");
    }
  }
  return address;
};

export default function QrPayment() {
  const [token, setToken] = useState("STRK");
  const [amount, setAmount] = useState("");
  const [tokenWei, setTokenWei] = useState<bigint>(BigInt(0));
  const [toggle, setToggle] = useState(false);
  const [toggleQR, setToggleQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addresses, loading: addressesLoading } = useWalletAddresses();

  // Check if wallet addresses are available before rendering
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setLoading(false);
    } else if (!addressesLoading) {
      setLoading(false);
    }
  }, [addresses, addressesLoading]);



  // Hardcoded Sepolia token addresses for Starknet tokens
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

  // Get receiver address based on token selection
  const getReceiverAddress = useCallback((): string => {
    if (!addresses || addresses.length === 0) return "";

    // For USDT, USDC, STRK - use Starknet address (index 3)
    if (["USDT", "USDC", "STRK"].includes(token)) {
      const starknetAddr = addresses[3]?.address || "";
      return normalizeStarknetAddress(
        starknetAddr,
        addresses[3]?.chain || "STRK"
      );
    }

    // For other tokens, use their respective wallet addresses
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

  // Get token address for monitoring
  const getTokenAddress = useCallback((): string => {
    // For Starknet tokens (USDT, USDC, STRK), return the contract address
    if (
      STARKNET_TOKEN_ADDRESSES[token as keyof typeof STARKNET_TOKEN_ADDRESSES]
    ) {
      return STARKNET_TOKEN_ADDRESSES[
        token as keyof typeof STARKNET_TOKEN_ADDRESSES
      ];
    }

    // For native tokens (ETH, BTC, SOL), return the wallet address as token identifier
    return getReceiverAddress();
  }, [token, STARKNET_TOKEN_ADDRESSES, getReceiverAddress]);

  // Get current receiver and token addresses
  const currentReceiverAddress = getReceiverAddress();
  const currentTokenAddress = getTokenAddress();

  const { paymentStatus, error } = usePaymentMonitor({
    expectedAmount: tokenWei,
    receiverAddress: currentReceiverAddress,
    tokenAddress: currentTokenAddress,
    enabled: !!qrData && !!currentReceiverAddress && !!currentTokenAddress,
    pollInterval: 10000,
  });

  if (paymentStatus === "success") {
    setTimeout(() => {
      handleCloseQR();
    }, 5000);
  }

  // Exchange rates (assumes rates[token] is NGN per 1 token unit)
  const { rates, isLoading: ratesLoading } = useExchangeRates();

  // Calculate tokenWei when amount or token changes
  useEffect(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setTokenWei(BigInt(0));
      return;
    }

    // Don't block calculation if we have fallback rates
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

    // Show loading only if rates are actually being fetched for the first time
    if (ratesLoading && !rates[token as keyof typeof rates]) {
      return "Loading...";
    }

    const ngnAmount = Number.parseFloat(amount);
    const tokenPriceInNGN = rates[token as keyof typeof rates] || 1;
    const tokenAmount = ngnAmount / tokenPriceInNGN;
    const displayDecimals = getDecimals(token) === 18 ? 6 : 9;

    return tokenAmount.toFixed(displayDecimals);
  }, [amount, token, rates, ratesLoading]);

  const handleQrToggle = useCallback(async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!currentReceiverAddress) {
      alert(
        "Receiver address not available. Please ensure wallet addresses are loaded."
      );
      return;
    }

    if (tokenWei === 0n) {
      alert("Invalid token amount calculation");
      return;
    }

    setIsProcessing(true);

    try {
     
      // UNIVERSAL QR CODE FORMAT - Compatible with Argent, Braavos, and all wallets
      const generateUniversalQRData = () => {
        const tokenAmount = calculateTokenAmount();

        // Create a comprehensive payment request string that includes both address and amount info
        const paymentData = {
          address: currentReceiverAddress,
          amount: tokenAmount,
          token: token,
          amountInWei: tokenWei.toString(),
          ngnAmount: amount,
        };

        console.log(paymentData)

        // For maximum compatibility, use the address as the primary QR data
        // but include payment details in a structured format that wallets can parse
        const qrData = `${currentReceiverAddress}?amount=${tokenAmount}&token=${token}&currency=NGN&ngnAmount=${amount}`;
        // Fallback to simple address for basic compatibility
        console.log(qrData)
        return currentReceiverAddress;
      };

      const universalQRData = generateUniversalQRData();

      // Generate QR code with universal format
      const qrCodeDataUrl = await QRCodeLib.toDataURL(universalQRData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrData(qrCodeDataUrl);
      setToggleQR(true);
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to create payment request");
    } finally {
      setIsProcessing(false);
    }
  }, [amount, currentReceiverAddress, token, tokenWei, calculateTokenAmount]);

  const handleTokenToggle = useCallback(() => {
    setToggle((prev) => !prev);
  }, []);

  const handleTokenChange = useCallback((tkn: string) => {
    setToken(tkn);
    setToggle(false);
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
    setToggleQR(false);
    setQrData("");
    setTokenWei(0n);
  }, []);

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

  const tokens = ["USDT", "USDC", "STRK", "ETH", "BTC", "SOL"];

  useEffect(() => {
    const handleClickOutside = () => {
      if (toggle) {
        setToggle(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [toggle]);

  // Show loading state while addresses are being fetched
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

  // Show error state if no addresses are available
  if (!addresses || addresses.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center gap-4 max-w-md">
          <h2 className="text-xl font-bold text-foreground">
            No Wallet Addresses
          </h2>
          <p className="text-muted-foreground text-center">
            Unable to retrieve wallet addresses. Please check your connection
            and try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mb-20 lg:mb-0 h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] flex  flex-col lg:flex-row items-center gap-8 pl-5 relative">
      <Card className="w-full border-border/50 mb-8 bg-card/50 backdrop-blur-sm mt-10 p-[32px_22px] flex flex-col gap-[24px] rounded-[12px] items-start">
        <div className="flex flex-col gap-[16px]">
          <h1 className="text-foreground text-custom-xl">
            QR Payment Generator
          </h1>
          <p className="text-muted-foreground text-custom-sm">
            Create a payment request and generate QR code for customers
          </p>
        </div>

        <div className="flex flex-col gap-[10px] w-full">
          <label htmlFor="amount" className="text-foreground text-custom-sm">
            Payment amount (NGN)
          </label>
          <div className="w-full flex p-[12px] items-center rounded-[7px] bg-background">
            <input
              type="text"
              id="amount"
              placeholder="300"
              value={amount}
              onChange={handleAmountChange}
              className="bg-transparent outline-none placeholder:text-muted-foreground w-full"
            />
            <div className="text-foreground flex flex-none items-center gap-1">
              <span className="text-muted-foreground">≈</span>
              <span className="font-medium">{calculateTokenAmount()}</span>
              <span className="text-muted-foreground">{token}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] w-full relative">
          <h1 className="text-foreground text-custom-sm">Select token</h1>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleTokenToggle();
            }}
            className="w-full flex p-[12px] items-center rounded-[7px] bg-background cursor-pointer"
          >
            <p className="text-muted-foreground">{token}</p>
          </div>
          {toggle && (
            <Card className="w-full max-w-[200px] flex flex-col items-start absolute top-full left-0 z-10 mt-1">
              {tokens.map((tkn, id) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTokenChange(tkn);
                  }}
                  key={id}
                  className="text-muted-foreground hover:bg-hover w-full p-2 text-left hover:text-hover"
                >
                  {tkn}
                </button>
              ))}
            </Card>
          )}
        </div>

        <div className="w-full flex justify-center">
          <button
            type="button"
            onClick={handleQrToggle}
            disabled={
              isProcessing ||
              tokenWei === 0n ||
              ratesLoading ||
              !currentReceiverAddress
            }
            className="rounded-[7px] bg-primary lg:w-[60%] p-[16px_32px] hover:bg-hover text-button cursor-pointer w-full hover:text-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? "Creating Payment Request..."
              : "Create Payment Request"}
          </button>
        </div>
      </Card>
      <div className="w-full flex flex-col  gap-[18px]">
        <h1 className="text-custom-lg text-foreground">
          How to Accept Payments
        </h1>
        <div className="w-full  justify-between overflow-x-scroll grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
          {steps.map((step, id) => (
            <Card key={id} className="flex text-muted-foreground border-border/50 mb-8 bg-card/50 backdrop-blur-sm">
              <Dot className="stroke-3" />
              <div className="flex flex-col gap-[7px]">
                <h3 className="font-[500] text-custom-sm">{step.step}</h3>
                <p className="text-custom-xs">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {toggleQR && (
        <Card
          className={`w-full h-full absolute top-0 bg-background items-center border-none right-0 ${
            toggleQR ? "flex" : "hidden"
          }`}
        >
          <div className="max-w-[370px] relative w-full h-full flex flex-col gap-[16px] items-center justify-center">
            <div className="w-full max-w-[250px] h-full max-h-[250px] relative">
              <Image src={qrData} alt="QrCode" fill />
            </div>

            {/* Display payment details for user clarity */}
            <div className="w-full text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Payment Amount:
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {calculateTokenAmount()} {token}
              </p>
              <p className="text-sm text-blue-600 mt-1">≈ ₦{amount} NGN</p>
            </div>

            <div className="flex flex-col gap-[16px] w-full">
              <div className="flex gap-[10px] justify-center items-center flex-wrap">
                <div className="flex space-x-2 border rounded-[7px] p-[8px_16px] text-custom-xs text-head border-[#2F80ED]">
                  <h4>Fee:</h4>
                  <p className="font-[600] text-foreground">0.5%</p>
                </div>
              </div>
            </div>
            {paymentStatus === "pending" && (
              <div className="w-full flex justify-center gap-[10px]">
                <div className="border-r-3 animate-spin w-[20px] h-[20px] border-[#2F80ED] rounded-full"></div>
                <p className="text-[#2F80ED] text-custom-md">Processing</p>
              </div>
            )}
            {paymentStatus === "success" && (
              <div className="w-full flex justify-center text-[#27AE60] gap-[10px]">
                <CheckCheck />
                <p className="text-custom-md">Successful</p>
              </div>
            )}
            {paymentStatus === "error" && (
              <div className="w-full flex justify-center gap-[10px] text-[#EB5757]">
                <TriangleAlert />
                <div className="flex flex-col text-custom-sm gap-[4px]">
                  <p>Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleCloseQR}
              className="mt-4 p-2 bg-gray-200 rounded"
            >
              Close
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
