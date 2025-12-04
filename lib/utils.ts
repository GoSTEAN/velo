import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const socialStyleNumber = (_num: string | number): string => {
  const num = Number(_num);
  if (num === null || num === undefined || Number.isNaN(num)) return "0";

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return num.toString();
};


export const validatePhoneNumber = (num: string): string => {
    const cleanNum = num.replace(/\D/g, ''); 
    
    let fixedNum = cleanNum;
    let originalFormat = '';
    
    if (cleanNum.startsWith("0")) {
        originalFormat = "0-prefix";
    } else if (cleanNum.startsWith("234")) {
        originalFormat = "234-prefix";
    } else if (/^[7-9][0-9]{9}$/.test(cleanNum)) {
        originalFormat = "10-digit";
    }
    
    if (cleanNum.startsWith("0")) {
        fixedNum = `234${cleanNum.slice(1)}`;
    } else if (cleanNum.startsWith("234")) {
        fixedNum = cleanNum;
    } else if (/^[7-9][0-9]{9}$/.test(cleanNum)) {
        fixedNum = `234${cleanNum}`;
    } else {
        if (cleanNum.length === 11 && !cleanNum.startsWith("0")) {
            throw new Error(`Invalid format: ${num}. Did you mean 0${cleanNum}?`);
        } else if (cleanNum.length === 12 && cleanNum.startsWith("234")) {
            throw new Error(`Invalid format: ${num}. Please provide all 13 digits for 234 prefix numbers`);
        } else if (cleanNum.length === 9 && /^[7-9][0-9]{8}$/.test(cleanNum)) {
            throw new Error(`Invalid format: ${num}. Please provide all 10 digits`);
        } else {
            throw new Error(`Invalid Nigerian phone number: ${num}. 
            Valid formats:
            • 08101842464 (11 digits starting with 0)
            • 8101842464 (10 digits)
            • 2348101842464 (13 digits starting with 234)`);
        }
    }
    
    if (!/^234[7-9][0-9]{9}$/.test(fixedNum)) {
        const firstDigitAfter234 = fixedNum.charAt(3);
        if (!/[7-9]/.test(firstDigitAfter234)) {
            throw new Error(`Invalid Nigerian phone number: ${num}. 
            Nigerian numbers must start with 070, 080, 081, 090, 091, etc.`);
        }
        if (fixedNum.length !== 13) {
            throw new Error(`Invalid length: ${num}. Expected 13 digits with 234 prefix, got ${fixedNum.length}`);
        }
        throw new Error(`Invalid Nigerian phone number: ${num}`);
    }
    
    return fixedNum;
};


export const formatToNGN = (amount: number = 0, decimal: boolean = true) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: !decimal ? 0 : 2,
  }).format(amount);
};

export const formatToNGNCompact = (amount: number = 0, decimal: boolean = true) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: !decimal ? 0 : 1,
  }).format(amount);
};