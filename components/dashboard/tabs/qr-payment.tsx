"use client";

import { Card } from "@/components/ui/Card";
import { CheckCheck, ChevronRight, Dot, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useContract } from "@starknet-react/core";
import QRCodeLib from "qrcode";
import Image from "next/image";
import { CallData, uint256 } from "starknet";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { usePaymentMonitor } from "@/components/hooks/usePaymentMonitor";

export default function QrPayment() {
  const [token, setToken] = useState("STRK");
  const [amount, setAmount] = useState(""); // Fiat amount (NGN)
  const [tokenWei, setTokenWei] = useState<bigint>(BigInt(0)); // Token amount in wei
  const [toggle, setToggle] = useState(false);
  const [toggleQR, setToggleQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { address, account } = useAccount();

  // Hardcoded Sepolia token addresses for reliability
  const TOKEN_ADDRESSES = {
    USDT: "0x0653B32FfffAB5fE7095Ea6044cCF72eDdf53968307935B97f1EDED0f1895407",
    USDC: "0x02613A46eC7f06Ae803A16BCE8ede8a72F5bF3Daf883C530d3A6E7719D31A7a7",
    STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    ETH: "0x049d36570d4e46f48e99674bd3fc014b791d9e77"
  };

  const getDecimals = (selectedToken: string): number => {
    return selectedToken === "STRK" || selectedToken === "ETH" ? 18 : 6;
  };

  const getTokenAddress = (tokenSymbol: string): string => {
    const address = TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES];
    if (!address) {
      throw new Error(`Token address not found for ${tokenSymbol}`);
    }
    return address;
  };

  const { paymentStatus, transaction, error } = usePaymentMonitor({
    expectedAmount: tokenWei,
    receiverAddress: address ?? "",
    tokenAddress: getTokenAddress(token),
    enabled: !!qrData, // Only monitor after QR is generated
    pollInterval: 10000
  });

  console.log("error", error);
  console.log("paymentStatus", paymentStatus);
  console.log("transaction", transaction);

  // Exchange rates (assumes rates[token] is NGN per 1 token unit)
  const { rates, isPending: ratesLoading } = useExchangeRates();

  // Contract address from env
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  // Contract instance
  const { contract } = useContract({
    address: contractAddress,
    abi: [
      {
        type: "function",
        name: "create_payment",
        inputs: [
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
          {
            name: "token",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "remarks",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "external",
      },
    ],
  });

  // Calculate tokenWei when amount or token changes
  useEffect(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || ratesLoading || !rates[token as keyof typeof rates]) {
      setTokenWei(BigInt(0));
      return;
    }

    const ngnAmount = parseFloat(amount);
    const tokenPriceInNGN = rates[token as keyof typeof rates] || 1; // NGN per 1 token
    const tokenAmount = ngnAmount / tokenPriceInNGN;
    const decimals = getDecimals(token);
    const amountInWei = BigInt(Math.floor(tokenAmount * (10 ** decimals) * (1 - 0.005)));
    setTokenWei(amountInWei);
  }, [amount, token, rates, ratesLoading]);

  const handleQrToggle = useCallback(async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!address || !account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!contractAddress) {
      alert("Contract address not configured");
      return;
    }

    if (tokenWei === 0n) {
      alert("Invalid token amount calculation");
      return;
    }

    setIsProcessing(true);

    try {
      const tokenAddress = getTokenAddress(token);
      const amountU256 = uint256.bnToUint256(tokenWei);

      // Execute contract call
      const result = await account.execute({
        contractAddress,
        entrypoint: "create_payment",
        calldata: CallData.compile({
          receiver: address,
          amount: amountU256,
          token: tokenAddress,
          remarks: "QR Payment",
        }),
      });

      setPaymentRequestId(result.transaction_hash);

      // Create payment data for QR code
      const paymentData = {
        receiver: address,
        amount: tokenWei.toString(),
        token: tokenAddress,
        requestId: result.transaction_hash,
        fiatAmount: amount,
        fiatCurrency: "NGN",
      };

      // Generate QR code
      const qrCodeDataUrl = await QRCodeLib.toDataURL(JSON.stringify(paymentData), {
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
  }, [amount, address, account, token, contractAddress, tokenWei]);

  const calculateTokenAmount = useCallback(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return "0";
    }

    if (ratesLoading || !rates[token as keyof typeof rates]) {
      return "Loading...";
    }

    const ngnAmount = parseFloat(amount);
    const tokenPriceInNGN = rates[token as keyof typeof rates] || 1;
    const tokenAmount = ngnAmount / tokenPriceInNGN;
    const displayDecimals = getDecimals(token) === 18 ? 6 : 2;

    return tokenAmount.toFixed(displayDecimals);
  }, [amount, token, rates, ratesLoading]);

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
    setPaymentRequestId(null);
    setTokenWei(0n);
  }, []);

  const steps = [
    {
      step: "Create Payment Request",
      description: "Enter Amount And Select Currency To Create Payment Request",
    },
    {
      step: "Generate QR Code",
      description: "QR code is generated after payment request is created on-chain",
    },
    {
      step: "Customer Scans",
      description: "Customer Uses Argent Or Braavos Wallet To Scan QR Code",
    },
    {
      step: "Payment Confirmed",
      description: "Transaction Is Processed On Starknet And Confirmed Automatically",
    },
  ];

  const tokens = ["USDT", "USDC", "STRK", "ETH"];

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

  const convertedAmount = calculateTokenAmount();
  return (
    <div className="w-full transition-all duration-300 h-full max-w-[80%] md:p-[50px_20px_20px_80px] pl-5">
      <div className="w-full flex flex-col gap-[18px]">
        <h1 className="text-custom-lg text-foreground">
          How to Accept Payments
        </h1>
        <div className="w-full flex items-center">
          <div className="w-full flex justify-between overflow-x-scroll">
            {steps.map((step, id) => (
              <div key={id} className="flex text-muted-foreground flex-none">
                <Dot className="stroke-3" />
                <div className="flex flex-col gap-[7px]">
                  <h3 className="font-[500] text-custom-sm">{step.step}</h3>
                  <p className="text-custom-xs">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <ChevronRight className="text-muted-foreground lg:hidden" />
        </div>
      </div>

      <Card className="w-full bg-Card mt-10 p-[32px_22px] flex flex-col gap-[24px] rounded-[12px] items-start">
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
            <div className="text-black/20 flex flex-none">
              ≈{token}{" "}
              {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                <div className="text-muted-foreground">
                  {calculateTokenAmount()}
                </div>
              )}
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
            disabled={isProcessing || tokenWei === 0n || ratesLoading}
            className="rounded-[7px] lg:w-[60%] p-[16px_32px] bg-button hover:bg-hover text-button cursor-pointer w-full hover:text-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? "Creating Payment Request..."
              : "Create Payment Request"}
          </button>
        </div>
      </Card>

      {toggleQR && (
        <Card
          className={`w-full h-full absolute top-0 bg-background items-center border-none right-0 ${toggleQR ? "flex" : "hidden"}`}
        >
          <div className="max-w-[370px] relative w-full h-full flex flex-col gap-[16px] items-center justify-center">
            <div className="w-full max-w-[250px] h-full max-h-[250px] relative">
              <Image src={qrData} alt="QrCode" fill />
            </div>
            <div className="flex flex-col gap-[16px] w-full">
              <div className="flex gap-[20px] justify-around items-center">
                <div className="flex space-x-2 border rounded-[7px] p-[8px_16px] text-custom-xs text-head border-[#2F80ED]">
                  <h4>Amount:</h4>
                  <p className="font-[600]"> {token} {convertedAmount}</p>
                </div>
                <div className="flex space-x-2 border rounded-[7px] p-[8px_16px] text-custom-xs text-head border-[#2F80ED]">
                  <h4>Token:</h4>
                  <p className="font-[600]">{token}</p>
                </div>
                <div className="flex space-x-2 border rounded-[7px] p-[8px_16px] text-custom-xs text-head border-[#2F80ED]">
                  <h4>Fee:</h4>
                  <p className="font-[600]">0.5%</p>
                </div>
              </div>
              <div className="flex space-x-2 border rounded-[7px] p-2 text-sm border-blue-500">
                <h4>NGN:</h4>
                <p className="font-[600] truncate max-w-[120px]">
                {amount || "0"}
                </p>
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
                {transaction && (
                  <p className="text-xs">Tx: {transaction.hash.slice(0, 10)}...</p>
                )}
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