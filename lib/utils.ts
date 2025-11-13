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
    
    // Case 1: Numbers starting with 0 -> replace with 234
    if (cleanNum.startsWith("0")) {
        if (cleanNum.length !== 11) {
            throw new Error(`Invalid length: ${num}. Numbers starting with 0 should be 11 digits`);
        }
        fixedNum = `234${cleanNum.slice(1)}`;
    }
    // Case 2: Numbers starting with 234 -> keep as is
    else if (cleanNum.startsWith("234")) {
        if (cleanNum.length !== 13) {
            throw new Error(`Invalid length: ${num}. Numbers starting with 234 should be 13 digits`);
        }
        fixedNum = cleanNum;
    }
    // Case 3: Numbers that don't start with 0 or 234 -> throw error
    else {
        throw new Error(`Invalid format: ${num}. Nigerian numbers must start with 0 or 234`);
    }
    
    // Final validation for Nigerian number format
    if (!/^234[7-9][0-9]{9}$/.test(fixedNum)) {
        throw new Error(`Invalid Nigerian phone number: ${num}`);
    }
    
    return fixedNum;
};