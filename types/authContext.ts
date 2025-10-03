export type SendMoneyRequest = {
    chain: string; // "ethereum", "bitcoin", "solana", "starknet", "usdt_erc20"
    network: string; // "testnet" or "mainnet"
    toAddress: string; // Changed from toaddress to toAddress
    amount: string;
    fromAddress?: string; // optional if you have multiple addresses per chain
}


export type SendMoneyResponse = {
  message: string;
  txHash: string;
}

export type WalletAddress = {
  chain: string;
  address: string;
}

export type WalletBalance = {
  chain: string;
  network: string;
  address: string;
  balance: string;
  symbol: string;
}

export type SendMoneyNotificationData = {
  amount: string;
  currency: string;
  toAddress: string;
  txHash: string;
  details:  {
    fee: string;
    network: string;
  };
}

export type ReceiveMoneyNotificationData = {
  amount: string;
  currency: string;
  fromAddress: string;
  txHash: string;
  details:  {
    confirmations: number;
  };
}

export type SwapNotificationData = {
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  details:  {
    rate: string;
    slippage: string;
  };
}

export type Transaction = {
  id: string;
  type: string;
  chain: string;
  amount: string;
  currency: string;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  status: string;
  timestamp: string;
}

export type TransactionHistoryResponse = {
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  details?:  {
    loginTime?: string;
    ip?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type NotificationsResponse = {
  notifications: Notification[];
  pagination: PaginationInfo;
}

export type UnreadCountResponse = {
  unreadCount: number;
}

export type MarkAsReadResponse = {
  message: string;
  notification:  {
    id: string;
    isRead: boolean;
  };
}

export type DepositCheckResponse = {
  message: string;
}

export type ApiResponse<T> = {
  user?: T;
  [key: string]: any;
}

