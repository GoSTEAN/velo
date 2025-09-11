import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: `0x${string}` | undefined, chars: number): string {
  if (!address || address.length < chars * 2 + 2) return address ?? "";
  return `${address.slice(0, 5)}...${address.slice(-chars)}`;
}

export function shortenName(fName: string, lName: string): string {
  if ((!fName && !lName) || fName.length < 3) return fName.slice(0, 2);
  return `${fName.slice(0, 1)}${lName.slice(0, 1)}`;
}


export function ensureHexAddress(address: string): `0x${string}` {
  if (address.startsWith('0x')) {
    return address as `0x${string}`;
  }
  return `0x${address}`;
}

export function isValidStarknetAddress(address: string): address is `0x${string}` {
  return /^0x[0-9a-fA-F]{1,64}$/.test(address);
}

// utils/env.ts
export function getContractAddress(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set');
  }
  if (!address.startsWith('0x')) {
    throw new Error('Contract address must start with 0x');
  }
  return address as `0x${string}`;
}