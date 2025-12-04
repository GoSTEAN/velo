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
  ForgotPasswordCredentials,
  ForgotPasswordResponse,
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

// Resolve base API URL.
// During local development prefer DEV_BACKEND_API_URL if set so the client
// talks to your local backend (port 5500) while NEXT_PUBLIC_API_URL can
// remain pointed to the live backend. In production we always use
// NEXT_PUBLIC_API_URL.
const url = (() => {
  // Always resolve to NEXT_PUBLIC_API_URL. We prefer using the explicit
  // public backend URL configured in environment rather than a separate
  // DEV_BACKEND_API_URL to keep runtime behavior consistent across builds.
  return (process.env.NEXT_PUBLIC_API_URL as string) || "";
})();

// Service types
export interface SupportedNetwork {
  value: string;
  label: string;
  name: string;
}

export interface DataPlan {
  dataplanId: string;
  name: string;
  amount: string;
  validity: string;
  networkCode: string;
}

export interface ElectricityCompany {
  value: string;
  label: string;
  code: string;
  minAmount: number;
  maxAmount: number;
}

export interface MeterType {
  value: string;
  label: string;
  code: string;
}

export interface ExpectedAmount {
  cryptoAmount: number;
  cryptoCurrency: string;
  fiatAmount: number;
  chain: string;
  instructions: string;
  planDetails?: {
    id?: string;
    name: string;
    amount?: string;
    validity?: string;
  };
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchaseId: string;
    amount?: number;
    network?: string;
    phoneNumber?: string;
    providerReference?: string;
    cryptoAmount: number;
    cryptoCurrency: string;
    deliveredAt: Date;
    meterToken?: string;
    planName?: string;
  };
}

export interface MeterVerificationResponse {
  success: boolean;
  message: string;
  data: {
    valid: boolean;
    meterNumber: string;
    company: string;
    details: any;
    customerName: string
  };
}

class ApiClient {
  private baseURL: string;
  private cache = dataCache;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    this.baseURL = url;
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
    // Build full URL safely and headers
    const runtimeBase =
      typeof window !== "undefined" && (window as any).__VELO_API_URL
        ? String((window as any).__VELO_API_URL).replace(/\/$/, "")
        : this.baseURL
        ? this.baseURL.replace(/\/$/, "")
        : "";
    const base = runtimeBase;
    const ep = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullUrl = base ? `${base}${ep}` : `/api${ep}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      try {
        const masked = `Bearer ${String(token).slice(0, 8)}...${String(token).slice(-6)}`;
        // Keep this as debug-only output to avoid noisy production logs
        if (typeof window !== "undefined") console.debug(`apiClient.makeRequest: Authorization: ${masked}`);
      } catch (e) {}
    }

    // Diagnostic: log when no token is present so we can see why requests go unauthenticated
    if (!token && typeof window !== "undefined") {
      console.debug(`apiClient.makeRequest: no auth token present for ${fullUrl}`);
    }

    this.cache.setFetching(cacheKey, true);

    // Fail-fast timeout so very slow backends don't block the UI; default 15s.
    // Allow per-request override via options.timeoutMs (added to RequestOptions).
    const controller = new AbortController();
    const timeoutMs =
      ((options && (options as any).timeoutMs) ??
        Number(process.env.NEXT_PUBLIC_API_REQUEST_TIMEOUT_MS)) ||
      15000;
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutHandle);

      // Handle auth expiration
      if (response.status === 401) {
        // Try to capture response body to help debugging (may be JSON or text)
        try {
          const respText = await response.clone().text();
          if (typeof window !== "undefined") console.warn(`apiClient.makeRequest: 401 response body for ${fullUrl}:`, respText);
        } catch (e) {
          // ignore
        }
        // If the app is currently initializing auth (syncing/validating a
        // NextAuth session), don't clear the token immediately. Clearing the
        // token while NextAuth still has a valid session can cause a
        // re-sync loop (client clears token -> NextAuth session resyncs ->
        // token written again -> background request triggers 401 -> repeat).
        const isInitializing = typeof window !== "undefined" && (window as any).__VELO_AUTH_INITIALIZING;
        if (isInitializing) {
          // Notify listeners that a 401 occurred during initialization. Do
          // not remove the stored token here; the validation flow in
          // AuthContext will detect invalid tokens and clear them in a
          // controlled manner.
          window.dispatchEvent(new CustomEvent("tokenExpiredEarly"));
        } else {
          // record timestamp of the 401 so sync logic can avoid an immediate
          // NextAuth re-sync loop
          try {
            if (typeof window !== "undefined") (window as any).__VELO_LAST_401_TS = Date.now();
          } catch (e) {}
          tokenManager.clearToken();
          window.dispatchEvent(new CustomEvent("tokenExpired"));
        }
        throw new Error("Authentication token expired. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(
          errorData.message || `API error: ${response.status} ${response.statusText}`
        );
        // Attach status and parsed body for callers to handle programmatically
        (err as any).status = response.status;
        (err as any).data = errorData;
        throw err;
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseErr) {
        const text = await response.text().catch(() => "");
        console.error(`Expected JSON from ${fullUrl} but received:`, text);
        throw new Error(`Invalid JSON response from server: ${text.slice(0, 200)}`);
      }

      // Cache GET responses when cacheConfig provided
      if (options.method === "GET" && cacheConfig) {
        this.cache.set(cacheKey, data, cacheConfig.ttl);
      }

      return data as T;
    } catch (error) {
      if ((error as any)?.name === "AbortError") {
        console.error(`API request to ${fullUrl} aborted after ${timeoutMs}ms`);
        throw new Error("Request timed out. Please try again.");
      }
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    } finally {
      clearTimeout(timeoutHandle);
      this.cache.setFetching(cacheKey, false);
    }
  }

  private async backgroundRefresh<T>(
    endpoint: string,
    options: RequestOptions,
    cacheConfig: CacheConfig
  ): Promise<void> {
    const cacheKey = cacheConfig.cacheKey || endpoint;

    // If the client is still initializing auth (syncing NextAuth session or
    // validating tokens), skip background refresh to avoid triggering
    // requests that may return 401 and clear tokens while the app is still
    // finishing setup. The AuthContext sets window.__VELO_AUTH_INITIALIZING
    // during initialization.
    if (typeof window !== "undefined" && (window as any).__VELO_AUTH_INITIALIZING) {
      // Defer refresh; skip this run.
      return;
    }

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
  // Allow callers to optionally supply a per-request timeout (ms)
  async login(
    credentials: LoginCredentials,
    timeoutMs?: number
  ): Promise<AuthResponse> {
    // Be tolerant of a single transient network/timeout error by retrying once
    const maxAttempts = 2;
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await this.request<AuthResponse>("/auth/login", {
          method: "POST",
          body: credentials,
          timeoutMs,
        });
      } catch (err) {
        attempt += 1;
        const msg = (err as any)?.message ?? "";
        const isTimeout = msg.toLowerCase().includes("timed out") || (err as any)?.name === "AbortError";
        const isNetworkError = msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network");

        // If it's not a timeout/network error, or we've exhausted attempts, rethrow
        if (attempt >= maxAttempts || (!isTimeout && !isNetworkError)) {
          throw err;
        }

        // small backoff before retrying
        await new Promise((res) => setTimeout(res, 500 * attempt));
      }
    }

    // Shouldn't reach here, but satisfy return type
    throw new Error("Login failed after retries");
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: credentials,
    });
  }

  async ForgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return this.request<RegisterResponse>("/auth/forgot-password", {
      method: "POST",
      body: { email },
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

  async SetPin(pin: string): Promise<ResendOtpResponse> {
    return this.request<ResendOtpResponse>("/user/transaction-pin", {
      method: "POST",
      body: { pin },
    });
  }

  async TransactionPin(pin: string): Promise<ResendOtpResponse> {
    return this.request<ResendOtpResponse>("/user/transaction-pin/verify", {
      method: "POST",
      body: { pin },
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
        staleWhileRevalidate: true,
      }
    );
  };

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
      "/wallet/addresses/mainnet",
      { method: "GET" },
      {
          // Increase TTL to reduce repeated slow calls - addresses rarely change
          ttl: 60 * 60 * 1000, // 60 minutes
        backgroundRefresh: true,
      }
    ).then((data) => data.addresses || []);
  }

  async getWalletBalances(): Promise<WalletBalance[]> {
    return this.request<{ balances: WalletBalance[] }>(
      "/wallet/balances/mainnet",
      { method: "GET" },
      {
          // Increase balance TTL so UI doesn't hammer slow backend; balances
          // still refreshed in background via backgroundRefresh: true
          ttl: 5 * 60 * 1000, // 5 minutes
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
    this.cache.invalidateCache(["/wallet/balances/mainnet"]);
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
        ttl: 30 * 1000,
        backgroundRefresh: true,
      }
    );
  }

  getUnreadCount = async (): Promise<number> => {
    return this.request<UnreadCountResponse>(
      "/notification/count",
      { method: "GET" },
      { ttl: 30 * 1000, backgroundRefresh: true }
    )
      .then((data) => data?.unreadCount ?? 0)
      .catch(() => 0);
  };

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
        // Increase TTL for transaction history to reduce repeated slow calls.
        // Transactions don't change every second; a 5 minute TTL improves UX
        // while still allowing background refresh.
        ttl: 5 * 60 * 1000, // 5 minutes
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

  async executeSplitPayment(
    id: string,
    pin: string
  ): Promise<ExecuteSplitPaymentResponse> {
    const result = await this.request<ExecuteSplitPaymentResponse>(
      `/split-payment/${id}/execute`,
      {
        method: "POST",
        body: {
          transactionPin: pin,
        },
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
    // This endpoint can be slow on some backends; allow a longer timeout
    // and retry once if a timeout occurs to improve reliability.
    const maxAttempts = 2;
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await this.request<DepositCheckResponse>("/wallet/check-deposits", {
          method: "POST",
          // increase timeout to 60s for this call
          timeoutMs: 60000,
        });
      } catch (err) {
        attempt += 1;
        const msg = (err as any)?.message ?? "";
        const isTimeout = msg.toLowerCase().includes("timed out") || (err as any)?.name === "AbortError";
        if (!isTimeout || attempt >= maxAttempts) throw err;
        // small backoff before retrying
        console.warn(`checkDeposits attempt ${attempt} timed out; retrying...`);
        await new Promise((res) => setTimeout(res, 500 * attempt));
      }
    }

    throw new Error("checkDeposits failed after retries");
  }

  /**
   * Create a fiat deposit record on the backend. The backend may respond
   * with a `redirectUrl` (e.g., Moonpay) which the client should follow.
   */
  async createFiatDeposit(payload: { currencyTo: string; amountFrom: string | number; walletAddress?: string; }): Promise<any> {
    // Normalize payload for consistency
    const body = {
      currencyTo: String(payload.currencyTo || "").trim().toUpperCase(),
      amountFrom: typeof payload.amountFrom === "number" ? String(payload.amountFrom) : String(payload.amountFrom || "").trim(),
      walletAddress: payload.walletAddress ? String(payload.walletAddress).trim() : undefined,
    };

    if (typeof window !== "undefined") console.debug("apiClient.createFiatDeposit payload:", body);

    return this.request<any>("/fiat/deposit", {
      method: "POST",
      body,
    });
  }

  async checkDeploy(): Promise<DepositCheckResponse> {
    return this.request<DepositCheckResponse>(
      "/checkdeploy/balances/mainnet/deploy",
      {
        method: "GET",
      },
      {
        ttl: 30 * 1000,
      }
    );
  }

  // ==================== SERVICES ENDPOINTS ====================

  // Airtime API
  async getAirtimeSupportedNetworks(): Promise<SupportedNetwork[]> {
    return this.request<{ data: { networks: SupportedNetwork[] } }>(
      "/airtime/supported-options",
      { method: "GET" },
      { ttl: 10 * 60 * 1000 } 
    ).then((response) => response.data.networks);
  }

  async getAirtimeExpectedAmount(
    amount: number,
    chain: string
  ): Promise<ExpectedAmount> {
    return this.request<{ data: ExpectedAmount }>(
      `/airtime/expected-amount?amount=${amount}&chain=${chain}`,
      { method: "GET" },
      { ttl: 30 * 1000 } // Cache for 30 seconds
    ).then((response) => response.data);
  }

  async purchaseAirtime(data: {
    type: "airtime";
    amount: number;
    chain: string;
    phoneNumber: string;
    mobileNetwork: string;
    transactionHash: string;
  }): Promise<PurchaseResponse> {
    const result = await this.request<PurchaseResponse>("/airtime/purchase", {
      method: "POST",
      body: data,
    });

    // Invalidate related caches
    this.cache.invalidateCache(["/airtime/history"]);
    return result;
  }

  async getAirtimeHistory(limit: number = 10) {
    return this.request(
      `/airtime/history?limit=${limit}`,
      { method: "GET" },
      {
        // Cache history longer to avoid repeated slow calls during navigation
        ttl: 5 * 60 * 1000, // 5 minutes
        backgroundRefresh: true,
      }
    );
  }

  // Data API
  async getDataSupportedNetworks(): Promise<SupportedNetwork[]> {
    return this.request<{ data: { networks: SupportedNetwork[] } }>(
      "/data/supported-options",
      { method: "GET" },
      { ttl: 10 * 60 * 1000 }
    ).then((response) => response.data.networks);
  }

  async getDataPlans(
    network: string,
    refresh: boolean = false
  ): Promise<DataPlan[]> {
    return this.request<{ data: { plans: DataPlan[] } }>(
      `/data/plans?network=${network}&refresh=${refresh}`,
      { method: "GET" },
      { ttl: refresh ? 0 : 6 * 60 * 60 * 1000 } 
    ).then((response) => response.data.plans);
  }

  async getDataExpectedAmount(
    dataplanId: string,
    network: string,
    chain: string
  ): Promise<ExpectedAmount> {
    return this.request<{ data: ExpectedAmount }>(
      `/data/expected-amount?dataplanId=${dataplanId}&network=${network}&chain=${chain}`,
      { method: "GET" },
      { ttl: 30 * 1000 }
    ).then((response) => response.data);
  }

  async purchaseData(data: {
    type: "data";
    dataplanId: string;
    amount: number;
    chain: string;
    phoneNumber: string;
    mobileNetwork: string;
    transactionHash: string;
  }): Promise<PurchaseResponse> {
    const result = await this.request<PurchaseResponse>("/data/purchase", {
      method: "POST",
      body: data,
    });

    this.cache.invalidateCache(["/data/history"]);
    return result;
  }

  async getDataHistory(limit: number = 10) {
    return this.request(
      `/data/history?limit=${limit}`,
      { method: "GET" },
      {
        ttl: 5 * 60 * 1000,
        backgroundRefresh: true,
      }
    );
  }

  // Electricity API
  async getElectricitySupportedOptions(): Promise<{
    companies: ElectricityCompany[];
    meterTypes: MeterType[];
  }> {
    return this.request<{
      data: { companies: ElectricityCompany[]; meterTypes: MeterType[] };
    }>(
      "/electricity/supported-options",
      { method: "GET" },
      { ttl: 10 * 60 * 1000 }
    ).then((response) => ({
      companies: response.data.companies,
      meterTypes: response.data.meterTypes,
    }));
  }

  async verifyElectricityMeter(
    company: string,
    meterNumber: string
  ): Promise<MeterVerificationResponse> {
    return this.request<MeterVerificationResponse>(
      `/electricity/verify-meter?company=${company}&meterNumber=${meterNumber}`,
      { method: "GET" }
    );
  }

  async getElectricityExpectedAmount(
    amount: number,
    chain: string
  ): Promise<ExpectedAmount> {
    return this.request<{ data: ExpectedAmount }>(
      `/electricity/expected-amount?amount=${amount}&chain=${chain}`,
      { method: "GET" },
      { ttl: 30 * 1000 }
    ).then((response) => response.data);
  }

  async purchaseElectricity(data: {
    type: "electricity";
    amount: number;
    chain: string;
    company: string;
    meterType: string;
    meterNumber: string;
    phoneNumber: string;
    transactionHash: string;
  }): Promise<PurchaseResponse> {
    const result = await this.request<PurchaseResponse>(
      "/electricity/purchase",
      {
        method: "POST",
        body: data,
      }
    );

    this.cache.invalidateCache(["/electricity/history"]);
    return result;
  }

  async getElectricityHistory(limit: number = 10) {
    return this.request(
      `/electricity/history?limit=${limit}`,
      { method: "GET" },
      {
        ttl: 5 * 60 * 1000,
        backgroundRefresh: true,
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
