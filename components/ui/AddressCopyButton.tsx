import React, { useState } from 'react';
import { Copy, Check } from "lucide-react";
import { fixStarknetAddress } from "@/components/lib/utils";

interface AddressCopyButtonProps {
  address: string;
  chain?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export const AddressCopyButton: React.FC<AddressCopyButtonProps> = ({
  address,
  chain = "",
  size = 'md',
  showIcon = true,
  showText = true,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;

    try {
      const addressToCopy = chain.toLowerCase() === "starknet" 
        ? fixStarknetAddress(address, chain)
        : address;

      await navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address: ", err);
    }
  };

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  if (!address) return null;

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center justify-center gap-1
        text-muted-foreground hover:text-foreground 
        transition-colors rounded-lg hover:bg-accent/50
        ${sizeClasses[size]} ${className}
      `}
      title={copied ? "Copied!" : "Copy address"}
      disabled={copied}
    >
      {showIcon && (
        copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />
      )}
      {showText && (
        <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
      )}
    </button>
  );
};