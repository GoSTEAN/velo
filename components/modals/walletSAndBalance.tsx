"use client";

import React, { memo, useMemo, useCallback } from "react";
import { useTokenBalance } from "../hooks";
import chroma from "chroma-js";
import useExchangeRates from "../hooks/useExchangeRate";
import { formatToNGN } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const TokenCard = memo(({
  token,
  isSelected,
  baseColor,
  onSelect,
  getBalance,
  calculateNGN
}: {
  token: any;
  isSelected: boolean;
  baseColor: string;
  onSelect: (chain: string) => void;
  getBalance: (chain: string) => string;
  calculateNGN: (bal: number, chain: string) => number;
}) => {
  const textColor = useMemo(() => 
    chroma.contrast(baseColor, "#FFFFFF") > 4.5 ? "#FFFFFF" : "#000000",
    [baseColor]
  );

  const gradient = useMemo(() => {
    const darker = chroma(baseColor).darken(0.3).hex();
    const lighter = chroma(baseColor).brighten(0.3).hex();
    return `linear-gradient(135deg, ${darker} 0%, ${baseColor} 50%, ${lighter} 100%)`;
  }, [baseColor]);

  const shadow = useMemo(() => {
    const shadowColor = chroma(baseColor).darken(0.5).alpha(0.3).css();
    return `0 10px 25px -5px ${shadowColor}, 0 5px 10px 2px ${shadowColor}`;
  }, [baseColor]);

  const handleClick = useCallback(() => {
    onSelect(token.chain);
  }, [onSelect, token.chain]);

  return (
    <button
      className={`flex flex-col justify-between text-start p-5 rounded-2xl transition-all duration-300 ${
        isSelected
          ? "ring-4 ring-offset-2 ring-white/50 scale-105"
          : "hover:scale-105 hover:shadow-xl"
      }`}
      onClick={handleClick}
      key={token.chain}
      style={{
        background: gradient,
        color: textColor,
        boxShadow: shadow,
        border: isSelected ? `3px solid ${textColor}` : "none",
      }}
    >
      <div className="flex items-start gap-2 justify-between">
        <div className="text-lg flex flex-none  font-bold capitalize  max-w-[120px]">
          {token.symbol}
        </div>
        <div className=" truncate font-bold tracking-tight">
          {getBalance(token.chain)}
        </div>
      </div>

      <div className="mt-6">
        {formatToNGN(calculateNGN(token.balance, token.chain))}
      </div>
    </button>
  );
});

TokenCard.displayName = "TokenCard";

function WalletSAndBalance({
  selectedToken,
  setSelectedToken,
}: {
  selectedToken: string | null;
  setSelectedToken: (arg: string) => void;
}) {
  const { rates } = useExchangeRates();
  const {
    tokensWithBalance,
    isLoading,
    availableTokens,
    balances,
    getTokenSymbol,
  } = useTokenBalance();

  console.log("WalletSAndBalance render", {
    tokensCount: tokensWithBalance?.length,
    selectedToken,
    isLoading
  });

  const calculateNGN = useCallback((bal: number | string, chain: string) => {
    if (!rates || Object.keys(rates).length === 0) return 0;
    const tokenSymbol = getTokenSymbol(chain).toUpperCase();
    const rate = rates[tokenSymbol as keyof typeof rates];
    if (!rate) {
      console.warn(`No rate found for ${tokenSymbol} (chain: ${chain})`);
      return 0;
    }
    const balance = typeof bal === "string" ? parseFloat(bal) : bal;
    const ngnValue = balance * rate;
    return ngnValue;
  }, [rates, getTokenSymbol]);

  const tokenColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    if (tokensWithBalance.length > 0) {
      tokensWithBalance.forEach((token, index) => {
        const hue = (index * (360 / tokensWithBalance.length)) % 360;
        const color = chroma.hsl(hue, 0.7, 0.6).hex();
        colorMap.set(token.chain, color);
      });
    }
    return colorMap;
  }, [tokensWithBalance]);

  const getBalance = useCallback((chain: string) => {
    const balance = balances?.find((bal) => bal.chain === chain);
    return parseFloat(balance?.balance || "0").toFixed(4);
  }, [balances]);

  const handleTokenSelect = useCallback((chain: string) => {
    console.log("Selecting token:", chain);
    setSelectedToken(chain);
  }, [setSelectedToken]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 p-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ))}
      </div>
    );
  }

  if (availableTokens.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">No tokens available</div>
    );
  }

  if (tokensWithBalance.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No tokens with balance available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {tokensWithBalance.map((token) => (
        <TokenCard
          key={token.chain}
          token={token}
          isSelected={selectedToken === token.chain}
          baseColor={tokenColors.get(token.chain) || chroma.random().hex()}
          onSelect={handleTokenSelect}
          getBalance={getBalance}
          calculateNGN={calculateNGN}
        />
      ))}
    </div>
  );
}

export default memo(WalletSAndBalance);