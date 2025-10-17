import { tokenManager } from "@/components/lib/api";
import { dataCache } from "@/lib/api-cache";
import {
  // Cache types
  CacheConfig,
  RequestOptions,
  // Params types
  NotificationParams,
  TransactionParams,
  TemplateParams,
  MerchantPaymentHistoryParams,
  ExecutionHistoryParams,
  // Auth types
  LoginCredentials,
  RegisterCredentials,
  VerifyOtpCredentials,
  AuthResponse,
  RegisterResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
  // Response types
  MerchantPaymentStats,
} from "./api-types";

import {
  SendMoneyRequest,
  SendMoneyResponse,
  WalletAddress,
  WalletBalance,
  TransactionHistoryResponse,
  NotificationsResponse,
  MarkAsReadResponse,
  UnreadCountResponse,
  DepositCheckResponse,
  UserProfile,
  CreateSplitPaymentRequest,
  CreateSplitPaymentResponse,
  ExecuteSplitPaymentResponse,
  ExecutionHistoryResponse,
  TemplatesResponse,
  ToggleSplitPaymentResponse,
  CreateMerchantPaymentRequest,
  CreateMerchantPaymentResponse,
  GetMerchantPaymentStatusResponse,
  PayMerchantInvoiceResponse,
  GetMerchantPaymentHistoryResponse,
} from "@/types/authContext";

class ApiClient {
  private baseURL: string;
  private cache = dataCache;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    this.baseURL = "https://velo-node-backend.onrender.com";
  }

  // Core request method with caching
  private async request<T>(
    endpoint: string,
    options: RequestOptions = { method: "GET" },
    cacheConfig?: CacheConfig
  ): Promise<T> {
    const token = tokenManager.getToken();

    const cacheKey = cacheConfig?.cacheKey || endpoint;
    const shouldCache = options.method === "GET" && cacheConfig;

    // Check cache first for GET requests
    if (shouldCache && !this.cache.isFetching(cacheKey)) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        // Start background refresh if data is stale
        if (cacheConfig.backgroundRefresh && cacheConfig.staleWhileRevalidate) {
          this.backgroundRefresh<T>(endpoint, options, cacheConfig);
        }
        return cached;
      }
    }

    // Check for pending requests to avoid duplicates
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Make the request
    const requestPromise = this.makeRequest<T>(
      endpoint,
      options,
      token,
      cacheKey,
      cacheConfig
    );
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  getCachedData<T>(key: string): T | null {
    return this.cache.get(key);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions,
    token: string | null,
    cacheKey: string,
    cacheConfig?: CacheConfig
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    this.cache.setFetching(cacheKey, true);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // NEW: Check for 401 Unauthorized (token rejected by backend)
      if (response.status === 401) {
        tokenManager.clearToken();
        // Dispatch event to show expiration dialog
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        throw new Error('Authentication token expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Pass TTL to cache set method
      if (options.method === "GET" && cacheConfig) {
        this.cache.set(cacheKey, data, cacheConfig.ttl);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    } finally {
      this.cache.setFetching(cacheKey, false);
    }
  }

  private async backgroundRefresh<T>(
    endpoint: string,
    options: RequestOptions,
    cacheConfig: CacheConfig
  ): Promise<void> {
    const cacheKey = cacheConfig.cacheKey || endpoint;

    if (this.cache.isFetching(cacheKey)) return;

    try {
      const token = tokenManager.getToken();
      await this.makeRequest<T>(
        endpoint,
        options,
        token,
        cacheKey,
        cacheConfig
      );
    } catch (error) {
      console.error(`Background refresh failed for ${cacheKey}:`, error);
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: credentials,
    });
  }

  async verifyOtp(
    credentials: VerifyOtpCredentials
  ): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: credentials,
    });
  }

  async resendOtp(email: string): Promise<ResendOtpResponse> {
    return this.request<ResendOtpResponse>("/auth/resend-otp", {
      method: "POST",
      body: { email },
    });
  }

  // User methods
    getUserProfile = async (): Promise<UserProfile> => {
    return this.request<UserProfile>(
      "/user/profile",
      { method: "GET" },
      { 
        ttl: 30 * 60 * 1000, // 30 minutes
        backgroundRefresh: true, 
        staleWhileRevalidate: true 
      }
    );
  }

  async updateUserProfile(
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> {
    const result = await this.request<UserProfile>("/user/profile", {
      method: "PUT",
      body: profileData,
    });

    // Invalidate profile cache
    this.cache.delete("/user/profile");
    return result;
  }

  // Wallet methods
  async getWalletAddresses(): Promise<WalletAddress[]> {
    return this.request<{ addresses: WalletAddress[] }>(
      "/wallet/addresses/testnet",
      { method: "GET" },
      {
        ttl: 10 * 60 * 1000, // 10 minutes - addresses don't change often
        backgroundRefresh: true,
      }
    ).then((data) => data.addresses || []);
  }

   async getWalletBalances(): Promise<WalletBalance[]> {
    return this.request<{ balances: WalletBalance[] }>(
      "/wallet/balances/testnet",
      { method: "GET" },
      {
        ttl: 2 * 60 * 1000, // 2 minutes - balances change more frequently
        backgroundRefresh: true,
      }
    ).then((data) => data.balances || []);
  }

  async sendTransaction(request: SendMoneyRequest): Promise<SendMoneyResponse> {
    const result = await this.request<SendMoneyResponse>("/wallet/send", {
      method: "POST",
      body: request,
    });

    // Invalidate balance cache after sending transaction
    this.cache.invalidateCache(["/wallet/balances/testnet"]);
    return result;
  }

  // Notification methods
  async getNotifications(
    params: NotificationParams = {}
  ): Promise<NotificationsResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.unreadOnly) queryParams.append("unreadonly", "true");

    const queryString = queryParams.toString();
    const endpoint = `/notification${queryString ? `?${queryString}` : ""}`;

    return this.request<NotificationsResponse>(
      endpoint,
      {
        method: "GET",
      },
      {
        ttl: 30 * 1000, // 30 seconds
        backgroundRefresh: true,
      }
    );
  }

   getUnreadCount = async (): Promise<number> => {
    return this.request<UnreadCountResponse>(
      "/notification/count",
      { method: "GET" },
      { ttl: 30 * 1000, backgroundRefresh: true }
    ).then((data) => (data?.unreadCount ?? 0))
     .catch(() => 0);
  }


  async markNotificationAsRead(
    notificationId: string
  ): Promise<MarkAsReadResponse> {
    const result = await this.request<MarkAsReadResponse>(
      `/notification/${notificationId}/read`,
      {
        method: "PATCH",
      }
    );

    // Invalidate notification caches
    this.cache.invalidateCache(["/notification", "/notification/count"]);
    return result;
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    const result = await this.request<{ message: string }>(
      "/notification/read-all",
      {
        method: "PATCH",
      }
    );

    this.cache.invalidateCache(["/notification", "/notification/count"]);
    return result;
  }

  // Transaction history
  async getTransactionHistory(
    params: TransactionParams = {}
  ): Promise<TransactionHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.chain) queryParams.append("chain", params.chain);
    if (params.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    const endpoint = `/history${queryString ? `?${queryString}` : ""}`;

    return this.request<TransactionHistoryResponse>(
      endpoint,
      {
        method: "GET",
      },
      {
        ttl: 60 * 1000, // 1 minute
        backgroundRefresh: true,
      }
    );
  }

  // Split payment methods
  async createSplitPayment(
    data: CreateSplitPaymentRequest
  ): Promise<CreateSplitPaymentResponse> {
    const result = await this.request<CreateSplitPaymentResponse>(
      "/split-payment/create",
      {
        method: "POST",
        body: data,
      }
    );

    this.cache.invalidateCache(["/split-payment/templates"]);
    return result;
  }

  async executeSplitPayment(id: string): Promise<ExecuteSplitPaymentResponse> {
    const result = await this.request<ExecuteSplitPaymentResponse>(
      `/split-payment/${id}/execute`,
      {
        method: "POST",
      }
    );

    this.cache.invalidateCache(["/split-payment/templates"]);
    return result;
  }

  async getSplitPaymentTemplates(
    params?: TemplateParams
  ): Promise<TemplatesResponse> {
    const query = params?.status ? `?status=${params.status}` : "";
    return this.request<TemplatesResponse>(
      `/split-payment/templates${query}`,
      {
        method: "GET",
      },
      {
        ttl: 2 * 60 * 1000, // 2 minutes
        backgroundRefresh: true,
      }
    );
  }

  async getExecutionHistory(
    id: string,
    params?: ExecutionHistoryParams
  ): Promise<ExecutionHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/split-payment/${id}/executions${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<ExecutionHistoryResponse>(
      endpoint,
      {
        method: "GET",
      },
      {
        ttl: 2 * 60 * 1000,
      }
    );
  }

  async toggleSplitPaymentStatus(
    id: string
  ): Promise<ToggleSplitPaymentResponse> {
    const result = await this.request<ToggleSplitPaymentResponse>(
      `/split-payment/${id}/toggle`,
      {
        method: "PATCH",
      }
    );

    this.cache.invalidateCache(["/split-payment/templates"]);
    return result;
  }

  // Merchant payment methods
  async createMerchantPayment(
    request: CreateMerchantPaymentRequest
  ): Promise<CreateMerchantPaymentResponse> {
    return this.request<CreateMerchantPaymentResponse>("/merchant/payments", {
      method: "POST",
      body: request,
    });
  }

  async getMerchantPaymentStatus(
    paymentId: string
  ): Promise<GetMerchantPaymentStatusResponse> {
    const cleanPaymentId = paymentId.replace(/\s+/g, "");
    return this.request<GetMerchantPaymentStatusResponse>(
      `/merchant/payments/${cleanPaymentId}/monitor`,
      {
        method: "POST",
      },
      {
        ttl: 10 * 1000, // 10 seconds for payment status
      }
    );
  }

  async payMerchantInvoice(
    paymentId: string,
    fromAddress: string
  ): Promise<PayMerchantInvoiceResponse> {
    return this.request<PayMerchantInvoiceResponse>("/merchant/pay", {
      method: "POST",
      body: { paymentId, fromAddress },
    });
  }

  async getMerchantPaymentHistory(
    params?: MerchantPaymentHistoryParams
  ): Promise<GetMerchantPaymentHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params?.merchantId) queryParams.append("merchantId", params.merchantId);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/merchant/payments${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<GetMerchantPaymentHistoryResponse>(
      endpoint,
      {
        method: "GET",
      },
      {
        ttl: 60 * 1000,
      }
    );
  }

  async getMerchantPaymentStats(): Promise<MerchantPaymentStats> {
    return this.request<MerchantPaymentStats>(
      "/merchant/payments/stats",
      {
        method: "GET",
      },
      {
        ttl: 60 * 1000,
        backgroundRefresh: true,
      }
    );
  }

  // Deposit methods
  async checkDeposits(): Promise<DepositCheckResponse> {
    return this.request<DepositCheckResponse>("/wallet/check-deposits", {
      method: "POST",
    });
  }

  async checkDeploy(): Promise<DepositCheckResponse> {
    return this.request<DepositCheckResponse>(
      "/checkdeploy/balances/testnet/deploy",
      {
        method: "GET",
      },
      {
        ttl: 30 * 1000,
      }
    );
  }

  // Cache management
  invalidateCache(keys: string[]): void {
    keys.forEach((key) => this.cache.delete(key));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();