import { UserProfile, 
} from '@/types/authContext';

// Cache configuration
export interface CacheConfig {
  ttl?: number; 
  backgroundRefresh?: boolean;
  staleWhileRevalidate?: boolean;
  cacheKey?: string;
}

// Request options
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

// Domain-specific params
export interface NotificationParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface TransactionParams {
  page?: number;
  limit?: number;
  chain?: string;
  type?: string;
}

export interface TemplateParams {
  status?: string;
}

export interface MerchantPaymentHistoryParams {
  merchantId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ExecutionHistoryParams {
  page?: number;
  limit?: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface VerifyOtpCredentials {
  email: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  user?: UserProfile;
}

export interface RegisterResponse {
  success: boolean;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Merchant Stats
export interface MerchantPaymentStats {
  stats: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    totalAmount: string;
  };
}