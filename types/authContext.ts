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


export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  isEmailVerified: boolean;
  kyc: any | null;
  kycStatus: string;
  createdAt: string;
  username: string | null;
  displayPicture: string | null;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName?: string;
  } | null;
}

export interface ApiResponse<T = any> {
  user: UserProfile;
  success: boolean;
  dataT: T;
  messageT: string;
}


export type SplitPaymentRecipient = {
  address: string;
  amount: string;
  name: string;
  email?: string;
}

export type SplitPaymentTemplate = {
  id: string;
  title: string;
  description: string;
  chain: string; // "ethereum", "bitcoin", "solana", "usdt_erc20"
  network: string; // "testnet" or "mainnet"
  fromAddress: string;
  recipients: SplitPaymentRecipient[];
  totalAmount?: string;
  totalRecipients?: number;
  status?: string; // "active", "inactive"
  executionCount?: number;
  createdAt?: string;
  currency?: string;
  lastExecutedAt?: string;
  recipientCount?: number;
  canExecute?: boolean;
}

export type CreateSplitPaymentRequest = {
  title: string;
  description: string;
  chain: string;
  network: string;
  fromAddress: string;
  recipients: SplitPaymentRecipient[];
}

export type CreateSplitPaymentResponse = {
  message: string;
  splitpayment: {
    id: string;
    title: string;
    description: string;
    totalAmount: string;
    totalRecipients: number;
    chain: string;
    network: string;
    status: string;
    executionCount: number;
    createdAt: string;
  };
  recipients: Array<{
    address: string;
    name: string;
    amount: string;
  }>;
}

export type ExecuteSplitPaymentResponse = {
  message: string;
  execution: {
    id: string;
    status: string;
    total: number;
    successful: number;
    failed: number;
    executionNumber: number;
  };
  splitpayment: {
    id: string;
    title: string;
    totalExecutions: number;
    lastExecutedAt: string;
  };
  results: Array<{
    recipient: string;
    name: string;
    amount: string;
    success: boolean;
    txHash: string;
    error: string | null;
  }>;
}

export type SplitPaymentExecution = {
  id: string;
  status: string;
  totalAmount: string;
  totalRecipients: number;
  successfulPayments: number;
  failedPayments: number;
  totalFees: string;
  createdAt: string;
  completedAt: string;
  resultCount: number;
}

export type ExecutionHistoryResponse = {
  message: string;
  splitPayment: {
    id: string;
    title: string;
    totalExecutions: number;
  };
  executions: SplitPaymentExecution[];
  pagination: PaginationInfo;
}

export type TemplatesResponse = {
  message: string;
  templates: Array<{
    id: string;
    title: string;
    description: string;
    chain: string;
    network: string;
    currency: string;
    totalAmount: string;
    totalRecipients: number;
    executionCount: number;
    status: string;
    createdAt: string;
    lastExecutedAt: string;
    recipientCount: number;
    canExecute: boolean;
  }>;
  totalTemplates: number;
}

export type ToggleSplitPaymentResponse = {
  message: string;
  splitpayment: {
    id: string;
    title: string;
    status: string;
    canExecute: boolean;
  };
}


export type CreateMerchantPaymentRequest = {
  amount: string;
  network: string;
  btcAddress: string;
  chain: string;
};

export type CreateMerchantPaymentResponse = {
  message: string;
  payment: {
    id: string;
    merchantId: string;
    amount: string;
    currency: string;
    status: string;
    description?: string;
    orderId?: string;
    paymentAddress?: string;
    qrCode?: string;
    expiresAt?: string;
    createdAt?: string;
  };
};

export type GetMerchantPaymentStatusResponse = {
  payment: {
    paymentId: string;
    merchantId: string;
    amount: string;
    currency: string;
    status: string;
    description?: string;
    orderId?: string;
    txHash?: string;
    paidAt?: string;
    customerEmail?: string;
    paymentAddress?: string;
  };
};

export type PayMerchantInvoiceRequest = {
  paymentId: string;
  fromAddress: string;
};

export type PayMerchantInvoiceResponse = {
  message: string;
  transaction: {
    txHash: string;
    paymentId: string;
    amount: string;
    currency: string;
    merchantId: string;
    status: string;
    paidAt?: string;
  };
};

export type GetMerchantPaymentHistoryResponse = {
  payments: Array<{
    paymentId: string;
    merchantId: string;
    amount: string;
    currency: string;
    status: string;
    description?: string;
    orderId?: string;
    paidAt?: string;
  }>;
  pagination: PaginationInfo;
};