import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: `0x${string}` | undefined, chars: number): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, 5)}...${address.slice(-chars)}`;
}

export function shortenName(fName: string, lName: string): string {
  if ((!fName && !lName) || fName.length < 3) return fName.slice(0, 2);
  return `${fName.slice(0, 1)}${lName.slice(0, 1)}`;
}
