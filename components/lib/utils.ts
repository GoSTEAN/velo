// components/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(
  address: `0x${string}` | undefined| string,
  chars: number
): string {
  if (!address || address.length < chars * 2 + 2) return address ?? "";
  return `${address.slice(0, 5)}...${address.slice(-chars)}`;
}


export function shortenName(name1: string, name2?: string): string {
  // Case 1: Two arguments provided - return first letter of each
  if (name2 !== undefined) {
    return `${name1.charAt(0)}${name2.charAt(0)}`;
  }
  
  // Case 2: Single argument provided
  const name = name1.trim();
  
  if (name.length <= 5) {
    return name; // Return whole word if 5 characters or less
  }
  
  return name.slice(0, 2); // Return first 2 characters if more than 5
}

export function ensureHexAddress(address: string): `0x${string}` {
  if (address.startsWith("0x")) {
    return address as `0x${string}`;
  }
  return `0x${address}`;
}

export function isValidStarknetAddress(
  address: string
): address is `0x${string}` {
  return /^0x[0-9a-fA-F]{1,64}$/.test(address);
}

// utils/env.ts
export function getContractAddress(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error(
      "NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set"
    );
  }
  if (!address.startsWith("0x")) {
    throw new Error("Contract address must start with 0x");
  }
  return address as `0x${string}`;
}
