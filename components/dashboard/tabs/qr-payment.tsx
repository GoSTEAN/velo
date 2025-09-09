"use client";

import { Card } from "@/components/ui/Card";
import { ChevronRight, Dot } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useContract } from "@starknet-react/core";
import QRCodeLib from "qrcode";
import Image from "next/image";
import { CallData, uint256 } from "starknet";
import { TOKEN_ADDRESSES } from "autoswap-sdk";
import useExchangeRates from "@/components/hooks/useExchangeRate";

export default function QrPayment() {
  const [token, setToken] = useState("STRK");
  const [amount, setAmount] = useState("");
  const [toggle, setToggle] = useState(false);
  const [toggleQR, setToggleQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { address, account } = useAccount();
  // Use the exchange rate hook
  const { rates, isPending: ratesLoading } = useExchangeRates();

  // Get contract address from environment variables
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  // Get the contract instance
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

    setIsProcessing(true);

    try {
      const ngnAmount = parseFloat(amount);
      const tokenRate = rates[token as keyof typeof rates] || 1;
      const tokenAmount = ngnAmount / tokenRate;
      const decimals = token === "STRK" || token === "ETH" ? 18 : 6;
      // Convert amount to u256 format for Starknet (assuming 6 decimals)

      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10 ** 6));
      const amountU256 = uint256.bnToUint256(amountInWei);

      // Get token address based on selection
      const tokenAddress = getTokenAddress(token);

      // Execute the contract call
      const result = await account.execute({
        contractAddress,
        entrypoint: "create_payment",
        calldata: CallData.compile({
          receiver: address, // Merchant receives the payment
          amount: amountU256,
          token: tokenAddress,
          remarks: "QR Payment", // You can customize this
        }),
      });

      // For Starknet, we get a transaction hash immediately
      setPaymentRequestId(result.transaction_hash);

      // Create payment data for QR code
      const paymentData = {
        contract: contractAddress,
        receiver: address,
        amount: amountInWei.toString(),
        token: tokenAddress,
        requestId: result.transaction_hash,
        fiatAmount: ngnAmount,
        fiatCurrency: "NGN",
      };

      // Convert to string for QR code
      const paymentString = JSON.stringify(paymentData);

      // Generate QR code
      const qrCodeDataUrl = await QRCodeLib.toDataURL(paymentString, {
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
  }, [amount, address, account, token, contractAddress]);

  // Helper function to get token contract addresses
  const getTokenAddress = (tokenSymbol: string): string => {
    const tokenAddresses = {
      USDT: TOKEN_ADDRESSES.USDT || "",
      USDC: TOKEN_ADDRESSES.USDC || "",
      STRK: TOKEN_ADDRESSES.STRK || "",
      ETH: TOKEN_ADDRESSES.ETH || "",
    };

    const address = tokenAddresses[tokenSymbol as keyof typeof tokenAddresses];
    if (!address) {
      throw new Error(`Token address not found for ${tokenSymbol}`);
    }
    return address;
  };

  const calculateTokenAmount = useCallback(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return "0";
    }

    if (ratesLoading || !rates[token as keyof typeof rates]) {
      return "Loading...";
    }

    const ngnAmount = parseFloat(amount);
    const tokenRate = rates[token as keyof typeof rates] || 1;
    const tokenAmount = ngnAmount / tokenRate;

    return tokenAmount.toFixed(token === "STRK" || token === "ETH" ? 6 : 2);
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
  }, []);

  const steps = [
    {
      step: "Create Payment Request",
      description: "Enter Amount And Select Currency To Create Payment Request",
    },
    {
      step: "Generate QR Code",
      description:
        "QR code is generated after payment request is created on-chain",
    },
    {
      step: "Customer Scans",
      description: "Customer Uses Argent Or Braavos Wallet To Scan QR Code",
    },
    {
      step: "Payment Confirmed",
      description:
        "Transaction Is Processed On Starknet And Confirmed Automatically",
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

  return (
    <div className="w-full transition-all  duration-300 h-full max-w-[80%] md:p-[50px_20px_20px_80px] pl-5">
      <div className="w-full flex flex-col gap-[18px]">
        <h1 className="text-custom-lg text-foreground">
          How to Accept Payments
        </h1>
        <div className="w-full flex items-center ">
          <div className="w-full flex justify-between overflow-x-scroll">
            {steps.map((step, id) => (
              <div key={id} className="flex text-muted-foreground flex-none">
                <Dot className="stroke-3 " />
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
            Payment amount
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
                <div className=" text-muted-foreground">
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
            disabled={isProcessing}
            className="rounded-[7px] lg:w-[60%] p-[16px_32px] bg-button hover:bg-hover text-button cursor-pointer w-full hover:text-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? "Creating Payment Request..."
              : "Create Payment Request"}
          </button>
        </div>
      </Card>

      {toggleQR && (
        // <div className="absolute w-full inset-0 bg-background bg-opacity-50 flex items-center justify-center z-50">
        //   <Card className="max-w-[370px] w-full max-h-[400px] p-6 flex flex-col gap-4 border-none items-center justify-center bg-background">
        //     <div className="w-full max-w-[250px] h-[250px] relative border">
        //       <Image
        //         src={qrData}
        //         alt="QrCode"
        //         fill
        //         className="object-contain"
        //       />
        //     </div>
        //     <div className="flex flex-col gap-3 w-full">
        //       <div className="flex space-x-2 border rounded-[7px] p-2 text-sm border-blue-500">
        //         <h4>Amount:</h4>
        //         <p className="font-[600]">
        //           {amount} {token}
        //         </p>
        //       </div>
        //       <div className="flex space-x-2 border rounded-[7px] p-2 text-sm border-blue-500">
        //         <h4>Request ID:</h4>
        //         <p className="font-[600] truncate max-w-[120px]">
        //           {paymentRequestId
        //             ? `${paymentRequestId.slice(0, 8)}...`
        //             : "N/A"}
        //         </p>
        //       </div>
        //     </div>
        //     <div className="w-full flex justify-center gap-2">
        //       <div className="border-r-3 animate-spin w-5 h-5 border-blue-500 rounded-full"></div>
        //       <p className="text-blue-500">Waiting for payment</p>
        //     </div>
        //     <button
        //       onClick={handleCloseQR}
        //       className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
        //     >
        //       Close
        //     </button>
        //   </Card>
        // </div>

        <Card
          className={` w-full h-full absolute top-0 bg-background items-center border-none right-0 ${
            toggleQR ? "flex" : "hidden"
          }`}
        >
          <div className="max-w-[370px] relative  w-full h-full flex flex-col gap-[16px] items-center justify-center">
            <div className="w-full max-w-[250px] h-full max-h-[250px] relative">
              <Image src={qrData} alt="QrCode" fill />
            </div>
            <div className="flex flex-col gap-[16px] w-full">
              <div className="flex gap-[20px]  justify-around items-center">
                <div className="flex space-x-2 border rounded-[7px] p-[8px_16px] text-custom-xs text-head border-[#2F80ED]">
                  <h4>Amount:</h4>
                  <p className="font-[600]">{amount}</p>
                </div>
                <div className="flex space-x-2 border rounded-[7px] p-[8px_16px] text-custom-xs text-head border-[#2F80ED]">
                  <h4>Token:</h4>
                  <p className="font-[600]">{token}</p>
                </div>
                <div className="flex space-x-2 border rounded-[7px] p-[8px_16px] text-custom-xs text-head border-[#2F80ED]">
                  <h4>Label:</h4>
                  <p className="font-[600]">0.5%</p>
                </div>
              </div>
              <div className="flex space-x-2 border rounded-[7px] p-2 text-sm border-blue-500">
                <h4>Request ID:</h4>
                <p className="font-[600] truncate max-w-[120px]">
                  {paymentRequestId
                    ? `${paymentRequestId.slice(0, 20)}...`
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="w-full flex justify-center gap-[10px] ">
              <div className="border-r-3 animate-spin w-[20px] h-[20px] border-[#2F80ED] rounded-full  "></div>
              <p className="text-[#2F80ED] text-custom-md">Processing</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
