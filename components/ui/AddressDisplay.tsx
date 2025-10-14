"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { shortenAddress } from "@/components/lib/utils";

interface AddressDisplayProps {
  address: string;
  showCopyButton?: boolean;
  shortenLength?: number;
  className?: string;
}

export function AddressDisplay({ 
  address, 
  showCopyButton = true, 
  shortenLength = 6,
  className = ""
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = useCallback(async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address: ", err);
    }
  }, [address]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-sm">
        {shortenAddress(address, shortenLength)}
      </span>
      {showCopyButton && (
        <button
          onClick={handleCopyAddress}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Copy address"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
    </div>
  );
}