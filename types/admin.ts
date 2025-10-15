export interface PerChainStats {
  chain: string;
  count: number;
  confirmedAmount: number;
}

export interface UsageStats {
  send: number;
  receive: number;
  qrPayment: number;
  splitting: number;
}

interface Holdings {
  chain: string;
  balance: number;
  usd: number;
}
export interface StatsData {
  holdings: Holdings[];
  totalUsers: number;
  totalConfirmedAmount: number;
  mostUsedChain: string;
  perChain: PerChainStats[];
  usage: UsageStats;
}
