"use client";

import { Card } from "@/components/ui/Card";
import { ChevronDown, Copy } from "lucide-react";
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
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
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties | null>(null);
  const { availableTokens,  getTokenName, hasWalletForToken } =
    useTokenBalance();
 
  // No-op effect placeholder (keeps hook deps stable) - removed debug logs
  useEffect(() => {}, [showTokenDropdown, availableTokens]);

  // Sort tokens alphabetically by name
  const sortedTokens = useMemo(() => {
    if (!availableTokens || availableTokens.length === 0) return [];
    // Put priority chains first (ethereum, bitcoin), then alphabetical
    const priority = ["ethereum", "bitcoin"];
    const sorted = [...availableTokens]
      .filter(Boolean)
      .sort((a, b) => {
        const aPri = priority.indexOf((a.chain || "").toLowerCase());
        const bPri = priority.indexOf((b.chain || "").toLowerCase());
        if (aPri !== -1 || bPri !== -1) {
          if (aPri === -1) return 1;
          if (bPri === -1) return -1;
          return aPri - bPri;
        }
        return (a.name || "").localeCompare(b.name || "");
      });
    return sorted;
  }, [availableTokens]);

  const selectedTokenData = sortedTokens.find(
    (token) => (token.chain || "").toLowerCase() === (selectedToken || "").toLowerCase()
  );

  const hasWalletForSelectedToken = hasWalletForToken(selectedToken);

  const handleTokenSelect = useCallback(
    (chain: string) => {
      onTokenSelect(chain);
      setShowTokenDropdown(false);
    },
    [onTokenSelect]
  );

  // Close dropdown when clicking outside and update position on scroll/resize
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showTokenDropdown) {
        if (triggerRef.current && !triggerRef.current.contains(target)) {
          setShowTokenDropdown(false);
        }
      }
    };

    const handleScrollOrResize = () => {
      if (!showTokenDropdown) return;
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Use fixed positioning so the dropdown is not clipped by transformed parents
      setDropdownStyle({
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.bottom + 8}px`,
        width: `${rect.width}px`,
      });
    };

    document.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
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
        ref={triggerRef}
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          const el = triggerRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
              setDropdownStyle({
                position: "fixed",
                left: `${rect.left}px`,
                top: `${rect.bottom + 8}px`,
                width: `${rect.width}px`,
              });
          }
          setShowTokenDropdown((s) => !s);
        }}
        className={`w-full flex px-3 py-2 items-center justify-between rounded-md bg-background border border-border/30 transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-border/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <TokenLogo chain={(selectedToken || "").toLowerCase()} symbol={selectedTokenData?.symbol} />
          <span className="text-foreground font-medium">
            {getTokenName((selectedToken || "").toLowerCase())}
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

      {showTokenDropdown && dropdownStyle && typeof document !== "undefined" &&
        createPortal(
          <div style={{ ...dropdownStyle, zIndex: 200000 }} className="pointer-events-auto">
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6, paddingLeft: 8 }}>Select Currency</div>
              <div style={{ background: 'var(--card)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: 8, maxHeight: 320, overflow: 'auto' }}>
                {sortedTokens.filter(t => t && t.chain).map((t) => (
                  <button
                    key={`dropdown-${t.chain}`}
                    onClick={(e) => { e.stopPropagation(); handleTokenSelect(t.chain); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px',
                      borderRadius: 6,
                      width: '100%',
                      textAlign: 'left',
                      background: (selectedToken || "").toLowerCase() === (t.chain || "").toLowerCase() ? 'rgba(59,130,246,0.08)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: 20, height: 20 }}>
                      <TokenLogo chain={t.chain} symbol={t.symbol} size={20} />
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{t.symbol}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}