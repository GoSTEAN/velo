// src/splits.ts
export type Recipient = {
  id: string;
  name: string;
  walletAddress: string;
  amount: string;
  percentage?: number; // Optional, calculated later
}

export type SplitData  = {
  title: string;
  description: string;
  recipients: Recipient[];
}

export type BackendNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  details?: {
    loginTime?: string;
    ip?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

export type FrontendNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "today" | "this-week" | "earlier";
  read: boolean;
  timestamp: Date;
  // Include backend fields for compatibility
  type?: string;
  message?: string;
  details?: any;
  isRead?: boolean;
  createdAt?: string;
  ip?: string;
  loginTime?: string;
  userAgent?: string;
}
