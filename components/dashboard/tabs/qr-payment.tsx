"use client";

import QrCode from "@/components/modals/qrCode-modal";
import { Card } from "@/components/ui/Card";
import { ChevronRight, Dot } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import QRCodeLib from "qrcode";
import Image from "next/image";

export default function QrPayment() {
  const [token, setToken] = useState("STRK");
  const [amount, setAmount] = useState("");
  const [toggle, setToggle] = useState(false);
  const [toggleQR, setToggleQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const { address } = useAccount();

  const handleQrToggle = useCallback(async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Create payment data that wallets can understand
      const paymentData = {
        address: address,
        amount: Number(amount),
        token: token,
      };

      // Convert to string for QR code
      const paymentString = JSON.stringify(paymentData);

      // Generate QR code
      const qrCodeDataUrl = await QRCodeLib.toDataURL(paymentString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "",
        },
      });

      setQrData(qrCodeDataUrl);
      setToggleQR(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code");
    }
  }, [amount, address, token]);

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

      // here am allowing only numbers and decimal point
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
      step: "Generate QR Code",
      description: "Enter Amount And Select Currency To Create Payment QR",
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
    {
      step: "Receive Funds",
      description: "Crypto Is Received In Your Wallet, Minus 0.5% Platform Fee",
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
    <div className="w-full transition-all duration-300 h-full max-w-[80%] md:p-[50px_20px_20px_80px] pl-5">
      <div className="w-full  flex flex-col gap-[18px]">
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

      <Card className="w-full bg-Card mt-10 p-[32px_22px] flex flex-col  gap-[24px]  rounded-[12px] items-start">
        <div className="flex flex-col gap-[16px]">
          <h1 className="text-foreground text-custom-xl">
            QR Payment Generator
          </h1>
          <p className="text-muted-foreground text-custom-sm">
            Generate QR codes for customer payments
          </p>
        </div>
        <div className="flex flex-col gap-[10px] w-full">
          <label htmlFor="amount" className="text-foreground text-custom-sm">
            Payment amount
          </label>
          <div className="w-full flex  p-[12px] items-center rounded-[7px] bg-background">
            <input
              type="text"
              id="amount"
              placeholder="300"
              value={amount}
              onChange={handleAmountChange}
              className="bg-transparent outline-none placeholder:text-muted-foreground w-full"
            />
            <p className="text-black/20 flex flex-none">{token}</p>
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
            className="rounded-[7px] lg:w-[60%] p-[16px_32px] bg-button hover:bg-hover text-button cursor-pointer w-full hover:text-hover"
          >
            Generate Payment
          </button>
        </div>
      </Card>

      <Card
        className={` w-full h-full absolute top-0 bg-background items-center border-none right-0 ${
          toggleQR ? "flex" : "hidden"
        }`}
      >
        <div className="max-w-[370px] relative max-h-[320px] w-full h-full flex flex-col gap-[16px] items-center justify-center">
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
          </div>
          <div className="w-full flex justify-center gap-[10px] ">
            <div className="border-r-3 animate-spin w-[20px] h-[20px] border-[#2F80ED] rounded-full  "></div>
            <p className="text-[#2F80ED] text-custom-md">Processing</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
