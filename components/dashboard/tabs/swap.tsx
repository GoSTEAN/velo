"use client";

import { Card } from "@/components/ui/Card";
import { ChevronDown, Shuffle } from "lucide-react";
import { useCallback, useState } from "react";
import { useAccount } from "@starknet-react/core";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import Image from "next/image";

export default function Swap() {
  const [fromToken, setFromToken] = useState("USDT");
  const [toToken, setToToken] = useState("NGN");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { address } = useAccount();
  const { rates } = useExchangeRates();

  // Mock balance data - in real app, fetch from contract
  const balances = {
    USDT: 4500,
    USDC: 2300,
    STRK: 1200,
    ETH: 0.5,
    NGN: 0,
  };

  const tokens = [
    { symbol: "USDT", name: "Tether", icon: "/usdtlogo.svg" },
    { symbol: "USDC", name: "USD Coin", icon: "🔵" },
    { symbol: "STRK", name: "Starknet", icon: "⭐" },
    { symbol: "ETH", name: "Ethereum", icon: "💎" },
  ];

  const calculateExchange = useCallback(
    (amount: string, from: string, to: string) => {
      if (
        !amount ||
        !rates[from as keyof typeof rates] ||
        !rates[to as keyof typeof rates]
      )
        return "";

      const fromRate = rates[from as keyof typeof rates] || 0;
      const toRate = rates[to as keyof typeof rates] || 1;

      if (from === "NGN") {
        return (parseFloat(amount) / fromRate).toFixed(6);
      } else if (to === "NGN") {
        return (parseFloat(amount) * fromRate).toFixed(2);
      } else {
        return ((parseFloat(amount) * fromRate) / toRate).toFixed(6);
      }
    },
    [rates]
  );

  const handleFromAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*\.?\d*$/.test(value)) {
        setFromAmount(value);
        setToAmount(calculateExchange(value, fromToken, toToken));
      }
    },
    [fromToken, toToken, calculateExchange]
  );

  const handleSwap = useCallback(() => {
    if (!fromAmount || !address) return;
    setShowConfirmModal(true);
  }, [fromAmount, address]);

  const confirmSwap = useCallback(async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
      setFromAmount("");
      setToAmount("");
    }, 3000);
  }, []);

  const fees = fromAmount ? (
    <span className="text-swap-amount">
      {(parseFloat(fromAmount) * 0.005).toFixed(6)}
    </span>
  ) : (
    <span className="text-swap-amount">0.0</span>
  );

  const receiveAmount = toAmount ? (
    <span className="text-swap-amount">
      {(
        parseFloat(toAmount) -
        parseFloat(
          fromAmount ? (parseFloat(fromAmount) * 0.005).toString() : "0"
        )
      ).toFixed(2)}
    </span>
  ) : (
    <span className="text-swap-amount">-- USDT</span>
  );

  return (
    <div className="w-full h-full transition-all duration-300 max-w-[80%] md:p-[50px_20px_20px_80px] pl-5 relative">
      <Card className="w-full bg-nav border-border pt-[32px] pr-[32px] pl-[32px] pb-[32px] rounded-[12px]">
        <div className="w-full flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="text-[24px] font-medium text-swap-title">Swap</h1>
            <p className="text-[16px] text-swap-description">
              Set up automatic payment distribution for SMEs (e.g., owner,
              workers, reserves)
            </p>
          </div>

          <div className="w-full flex flex-col gap-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[16px] font-medium text-swap-description">
                Account
              </h3>
            </div>

            <div className="relative">
              {/* From Token Section */}
              <Card className=" bg-background border-border w-full">
                <div className="flex flex-col gap-[12px] w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-custom-sm flex-1 text-left">
                      From
                    </span>
                    <span className="text-muted-foreground text-custom-sm text-right">
                      Available Balance:{" "}
                      {balances[fromToken as keyof typeof balances]}
                    </span>
                  </div>
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center justify-start">
                      <div className="relative">
                        <button
                          onClick={() => setShowFromDropdown(!showFromDropdown)}
                          className="flex items-center gap-[6px] text-foreground"
                          title={`Select token to swap from (currently ${fromToken})`}
                        >
                          <div className="w-8 h-8 rounded-full bg-swap-usdt flex items-center justify-center">
                            {fromToken === "USDT" ? (
                              <Image
                                src="/usdtlogo.svg"
                                alt="USDT"
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-white text-custom-xs font-bold">
                                {fromToken.slice(0, 1)}
                              </span>
                            )}
                          </div>
                          <span className="text-custom-sm font-medium">
                            {fromToken}
                          </span>
                          <ChevronDown size={16} />
                        </button>

                        {showFromDropdown && (
                          <div className="absolute top-full left-0 mt-1 bg-nav border border-border rounded-[8px] shadow-lg z-10 min-w-[120px]">
                            {tokens
                              .filter((token) => token.symbol !== toToken)
                              .map((token) => (
                                <button
                                  key={token.symbol}
                                  onClick={() => {
                                    setFromToken(token.symbol);
                                    setShowFromDropdown(false);
                                    setToAmount(
                                      calculateExchange(
                                        fromAmount,
                                        token.symbol,
                                        toToken
                                      )
                                    );
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-background flex items-center gap-2"
                                >
                                  {token.symbol === "USDT" ? (
                                    <Image
                                      src="/usdtlogo.svg"
                                      alt="USDT"
                                      width={20}
                                      height={20}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <span>{token.icon}</span>
                                  )}
                                  <span className="text-custom-sm">
                                    {token.symbol}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={fromAmount}
                      onChange={handleFromAmountChange}
                      placeholder="50"
                      className="bg-transparent text-right text-foreground text-custom-lg font-medium outline-none w-[100px]"
                    />
                  </div>
                </div>
              </Card>

              {/* Swap Icon - Positioned between cards */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 flex justify-center z-10">
                <div className="w-12 h-12 rounded-full bg-swap-primary flex items-center justify-center shadow-lg">
                  <Shuffle size={16} className="text-white" />
                </div>
              </div>

              {/* To Token Section */}
              <Card className=" pr-[24px] pl-[12px] bg-background border-border w-full">
                <div className="flex flex-col gap-[12px] w-full">
                  <span className="text-muted-foreground text-custom-sm">
                    To
                  </span>
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center justify-start">
                      <div className="relative">
                        <button
                          onClick={() => setShowToDropdown(!showToDropdown)}
                          className="flex items-center gap-[6px] text-foreground"
                          title={`Select token to swap to (currently ${
                            toToken === "NGN" ? "Naira" : toToken
                          })`}
                        >
                          <div className="w-8 h-8 rounded-full bg-swap-naira flex items-center justify-center">
                            <span className="text-white text-custom-xs font-bold">
                              ₦
                            </span>
                          </div>
                          <span className="text-custom-sm font-medium">
                            Naira
                          </span>
                          <ChevronDown size={16} />
                        </button>

                        {showToDropdown && (
                          <div className="absolute top-full left-0 mt-1 bg-nav border border-border rounded-[8px] shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={() => {
                                setToToken("NGN");
                                setShowToDropdown(false);
                                setToAmount(
                                  calculateExchange(
                                    fromAmount,
                                    fromToken,
                                    "NGN"
                                  )
                                );
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-background flex items-center gap-2"
                            >
                              <span>₦</span>
                              <span className="text-custom-sm">Naira</span>
                            </button>
                            {tokens
                              .filter((token) => token.symbol !== fromToken)
                              .map((token) => (
                                <button
                                  key={token.symbol}
                                  onClick={() => {
                                    setToToken(token.symbol);
                                    setShowToDropdown(false);
                                    setToAmount(
                                      calculateExchange(
                                        fromAmount,
                                        fromToken,
                                        token.symbol
                                      )
                                    );
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-background flex items-center gap-2"
                                >
                                  <span>{token.icon}</span>
                                  <span className="text-custom-sm">
                                    {token.symbol}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-foreground text-custom-lg font-medium">
                      {toAmount || "--"}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Fees and Receive */}
            <div className="flex flex-col gap-[8px] pt-[16px] border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-custom-sm">
                  Fees
                </span>
                <span className="text-foreground text-custom-sm">{fees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-custom-sm">
                  Receive
                </span>
                <span className="text-foreground text-custom-sm">
                  ~ {receiveAmount}
                </span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center w-full">
              <button
                onClick={handleSwap}
                disabled={!fromAmount || !address || isProcessing}
                style={{ width: "525px", height: "51px", maxWidth: "100%" }}
                className="py-[12px] cursor-pointer bg-swap-primary bg-swap-primary-hover disabled:bg-gray-400 text-white rounded-[12px] text-custom-md font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing
                  </>
                ) : (
                  "Swap"
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-[400px] mx-4 p-[32px] bg-nav">
            <div className="flex flex-col items-center gap-[24px]">
              <div className="w-16 h-16 rounded-full bg-swap-primary flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>

              <div className="text-center">
                <h3 className="text-foreground text-custom-lg font-medium mb-2">
                  Confirm Transaction
                </h3>
                <p className="text-muted-foreground text-custom-sm">
                  Are You Sure You Want To Go Ahead With This Transaction?
                </p>
              </div>

              <div className="w-full flex flex-col gap-[12px]">
                <button
                  onClick={confirmSwap}
                  className="w-full py-[16px] bg-swap-primary bg-swap-primary-hover text-white rounded-[12px] text-custom-md font-medium transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-[16px] bg-transparent border border-border text-foreground rounded-[12px] text-custom-md font-medium hover:bg-background transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-[400px] mx-4 p-[32px] bg-nav">
            <div className="flex flex-col items-center gap-[24px]">
              <div className="w-16 h-16 rounded-full bg-swap-primary flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
              </div>

              <div className="text-center">
                <h3 className="text-foreground text-custom-lg font-medium mb-2">
                  NGN Request Was Successful
                </h3>
                <p className="text-muted-foreground text-custom-sm">
                  Your Request Was Successful!!
                </p>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-[16px] bg-swap-primary bg-swap-primary-hover text-white rounded-[12px] text-custom-md font-medium transition-colors"
              >
                Back
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
