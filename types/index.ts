// src/splits.ts
export interface Recipient {
  id: string;
  name: string;
  walletAddress: string;
  amount: string;
  percentage?: number; // Optional, calculated later
}

export interface SplitData {
  title: string;
  description: string;
  recipients: Recipient[];
}