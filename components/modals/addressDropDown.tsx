// components/ui/AddressDropdown.tsx
"use client";

import { Card } from "@/components/ui/Card";
import { ChevronDown } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { TokenLogo } from "../ui/TokenLogo";
import { BalanceDisplay } from "../ui/BalanceDisplay";
import { AddressDisplay } from "../ui/AddressDisplay";
import { useTokenBalance } from "@/components/hooks/useTokenBalance";
import { fixStarknetAddress } from "../lib/utils";


interface AddressDropdownProps {
  selectedToken: string;
  onTokenSelect: (chain: string) => void;
  showBalance?: boolean;
  showNetwork?: boolean;
  showAddress?: boolean;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
}

export function AddressDropdown({
  selectedToken,
  onTokenSelect,
  showBalance = true,
  showNetwork = false,
  showAddress = false,
  disabled = false,
  className = "",
  dropdownClassName = "",
}: AddressDropdownProps) {
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const { availableTokens,  getTokenName, hasWalletForToken } =
    useTokenBalance();

  const selectedTokenData = availableTokens.find(
    (token) => token.chain === selectedToken
  );

  const hasWalletForSelectedToken = hasWalletForToken(selectedToken);

  const handleTokenSelect = useCallback(
    (chain: string) => {
      onTokenSelect(chain);
      setShowTokenDropdown(false);
    },
    [onTokenSelect]
  );

  // Close dropdown when clicking outside
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

  if (!availableTokens) {
    return (
      <div className={`w-full flex flex-col gap-3 relative ${className}`}>
        <label className="text-foreground text-sm font-medium">
          Select Currency
        </label>
        <div className="w-full p-3 rounded-lg bg-background border border-border animate-pulse">
          <div className="h-6 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col gap-3 relative ${className}`}>
      <label className="text-foreground text-sm font-medium">
        Select Currency
      </label>

      <div
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          setShowTokenDropdown(!showTokenDropdown);
        }}
        className={`w-full flex p-3 items-center justify-between rounded-lg bg-background border border-border transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-foreground/30"
        }`}
      >
        <div className="flex items-center gap-2">
          <TokenLogo chain={selectedToken} symbol={selectedTokenData?.symbol} />
          <span className="text-foreground font-medium">
            {getTokenName(selectedToken)}
          </span>
          {!hasWalletForSelectedToken && (
            <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">
              No Wallet
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${
            showTokenDropdown ? "rotate-180" : ""
          }`}
        />
      </div>

      {showTokenDropdown && (
        <Card
          className={`w-full absolute top-full justify-start z-99 flex flex-col text-muted-foreground left-0  mt-1 shadow-lg border border-border max-h-60 overflow-y-auto ${dropdownClassName}`}
        >
          {availableTokens.map((token) => (
            <button
              key={token.chain}
              onClick={(e) => {
                e.stopPropagation();
                handleTokenSelect(token.chain);
              }}
              className={`w-full rounded-md flex items-center gap-3 p-3 text-left hover:bg-hover hover:text-white transition-colors ${
                selectedToken === token.chain ? "bg-primary/10" : ""
              }`}
            >
              <TokenLogo chain={token.chain} symbol={token.symbol} />
              <div className="flex flex-col flex-1">
                <span className="font-medium">{token.name}</span>
                <div className="text-xs text-muted-foreground space-y-1">
                  {showBalance && (
                    <BalanceDisplay
                      balance={token.balance}
                      symbol={token.symbol}
                    />
                  )}
                  {showNetwork && <div>Network: {token.network}</div>}
                  {showAddress && token.address && (
                    <AddressDisplay
                      address={fixStarknetAddress(token.address, token.chain)}
                      showCopyButton={false}
                      shortenLength={6}
                    />
                  )}
                </div>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
