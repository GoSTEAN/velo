// types/split.ts (create this file)
export interface Recipient {
  id: string;
  name: string;
  walletAddress: string;
  amount: string;
  percentage?: number;
}

export interface SplitData {
  title: string;
  description: string;
  recipients: Recipient[];
}