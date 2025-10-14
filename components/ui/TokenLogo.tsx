// components/ui/TokenLogo.tsx
"use client";

import Image from "next/image";
import { useMemo } from "react";

interface TokenLogoProps {
  chain: string;
  symbol?: string;
  size?: number;
  className?: string;
}

export function TokenLogo({ chain, symbol, size = 16, className = "" }: TokenLogoProps) {
  const displaySymbol = useMemo(() => {
    if (symbol) return symbol;
    return chain.charAt(0).toUpperCase();
  }, [chain, symbol]);

  return (
    <div 
      className={`rounded-full bg-Card flex relative items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/${chain.toLowerCase()}.svg`}
        alt={chain}
        width={size}
        height={size}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
        className="object-cover"
      />
      <span 
        className="text-xs font-bold hidden items-center justify-center"
        style={{ fontSize: Math.max(size * 0.5, 10) }}
      >
        {displaySymbol}
      </span>
    </div>
  );
}