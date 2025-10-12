"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { tokenManager } from "@/components/lib/api";
import { useRouter } from "next/navigation";
import {
  WalletAddress,
  WalletBalance,
  NotificationsResponse,
  MarkAsReadResponse,
  SendMoneyNotificationData,
  ReceiveMoneyNotificationData,
  SwapNotificationData,
  TransactionHistoryResponse,
  DepositCheckResponse,
  SendMoneyRequest,
  SendMoneyResponse,
  UnreadCountResponse,
  UserProfile,
  ApiResponse,
  CreateSplitPaymentRequest,
  CreateSplitPaymentResponse,
  ExecuteSplitPaymentResponse,
  ExecutionHistoryResponse,
  TemplatesResponse,
  ToggleSplitPaymentResponse,
  CreateMerchantPaymentRequest,
  CreateMerchantPaymentResponse,
  GetMerchantPaymentHistoryResponse,
  GetMerchantPaymentStatusResponse,
  PayMerchantInvoiceResponse,
} from "@/types/authContext";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  register: (email: string, password: string) => Promise<{ success: boolean }>;
  verifyOtp: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (
    profileData: Partial<UserProfile>
  ) => Promise<UserProfile | null>;
  getWalletAddresses: () => Promise<WalletAddress[]>;
  getWalletBalances: () => Promise<WalletBalance[]>;
  fetchUserProfile: (token: string) => Promise<void>;
  // Notification functions
  getNotifications: (
    page?: number,
    limit?: number,
    unreadOnly?: boolean
  ) => Promise<NotificationsResponse>;
  getUnreadCount: () => Promise<number>;
  markNotificationAsRead: (
    notificationId: string
  ) => Promise<MarkAsReadResponse>;
  markAllNotificationsAsRead: () => Promise<{ message: string }>;
  createSendMoneyNotification: (
    data: SendMoneyNotificationData
  ) => Promise<{ message: string }>;
  createReceiveMoneyNotification: (
    data: ReceiveMoneyNotificationData
  ) => Promise<{ message: string }>;
  createSwapNotification: (
    data: SwapNotificationData
  ) => Promise<{ message: string }>;
  // Transaction history function
  getTransactionHistory: (
    page?: number,
    limit?: number,
    chain?: string,
    type?: string
  ) => Promise<TransactionHistoryResponse>;
  // Deposit check function
  checkDeposits: () => Promise<DepositCheckResponse>;
  checkDeploy: () => Promise<DepositCheckResponse>;
  // Send transaction function
  sendTransaction: (request: SendMoneyRequest) => Promise<SendMoneyResponse>;
  createSplitPayment: (
    data: CreateSplitPaymentRequest
  ) => Promise<CreateSplitPaymentResponse>;
  executeSplitPayment: (id: string) => Promise<ExecuteSplitPaymentResponse>;
  getSplitPaymentTemplates: (params?: {
    status?: string;
  }) => Promise<TemplatesResponse>;
  getExecutionHistory: (
    id: string,
    params?: { page?: number; limit?: number }
  ) => Promise<ExecutionHistoryResponse>;
  toggleSplitPaymentStatus: (id: string) => Promise<ToggleSplitPaymentResponse>;
  createMerchantPayment: (
    requestBody: CreateMerchantPaymentRequest
  ) => Promise<CreateMerchantPaymentResponse>;
  getMerchantPaymentStatus: (
    paymentId: string
  ) => Promise<GetMerchantPaymentStatusResponse>;
  payMerchantInvoice: (
    paymentId: string,
    fromAddress: string
  ) => Promise<PayMerchantInvoiceResponse>;
  getMerchantPaymentHistory: (params?: {
    merchantId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<GetMerchantPaymentHistoryResponse>;
  getMerchantPaymentStats: () => Promise<{
    stats: {
      total: number;
      pending: number;
      completed: number;
      cancelled: number;
      totalAmount: string;
    };
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async (authToken: string) => {
    try {
      console.log("🔄 Fetching user profile with token...");

      const profileRes = await fetch(
        "https://velo-node-backend.onrender.com/user/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!profileRes.ok) {
        throw new Error(`Failed to fetch profile: ${profileRes.status}`);
      }

      const responseData: ApiResponse<UserProfile> | UserProfile =
        await profileRes.json();

      // Handle wrapped user data
      const userProfile: UserProfile =
        (responseData as ApiResponse<UserProfile>).user ||
        (responseData as UserProfile);

      setUser(userProfile);
      // Store in localStorage immediately after setting user
      localStorage.setItem("user", JSON.stringify(userProfile));
    } catch (error) {
      console.error("❌ Failed to fetch user profile:", error);
      // Clear invalid token
      tokenManager.clearToken();
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🚀 Initializing auth...");

      const savedToken = tokenManager.getToken();
      const savedUser = localStorage.getItem("user");

      if (savedToken) {
        console.log("📱 Found saved token and user");
        setToken(savedToken);

        // Only use saved user as temporary data while fetching fresh data
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            // Handle nested user data from localStorage
            const userData = parsedUser.user || parsedUser;
            setUser(userData);
          } catch (error) {
            console.error("Error parsing saved user:", error);
            localStorage.removeItem("user");
          }
        }

        // Always fetch fresh profile data
        await fetchUserProfile(savedToken);
      } else {
        console.log("❌ No saved token found");
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const authRes = await fetch(
        "https://velo-node-backend.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const authData = await authRes.json();

      if (!authRes.ok) {
        throw new Error(authData.error || authData.message || "Login failed");
      }

      // Extract the accessToken from the response
      const receivedToken = authData.accessToken;

      if (receivedToken) {
        console.log("🎫 Token received, storing...");
        tokenManager.setToken(receivedToken);
        setToken(receivedToken);

        // Also set the user data from the login response if available
        if (authData.user) {
          console.log("👤 User data from login:", authData.user);
          const userData: UserProfile =
            (authData.user as ApiResponse<UserProfile>).user ||
            (authData.user as UserProfile);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setIsLoading(false);
        } else {
          // Only fetch profile if user data isn't in login response
          await fetchUserProfile(receivedToken);
        }

        return true;
      }

      throw new Error("No access token received from server");
    } catch (err) {
      setIsLoading(false);
      console.error("❌ Login error:", err);
      throw err;
    }
  };

  const logout = () => {
    console.log("🚪 Logging out...");
    tokenManager.removeToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("decryptedWallets");
    setToken(null);
    setUser(null);
    setIsLoading(false);
    router.push("/");
  };

  const register = async (
    email: string,
    password: string
  ): Promise<{ success: boolean }> => {
    try {
      // Register user with backend (only email and password)
      const res = await fetch(
        "https://velo-node-backend.onrender.com/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(
        "https://velo-node-backend.onrender.com/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          message: data.message || "Verification successful!",
        };
      } else {
        throw new Error(data.error || "Verification failed.");
      }
    } catch {
      throw new Error("Network error. Please try again.");
    }
  };

  const resendOtp = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(
        "https://velo-node-backend.onrender.com/auth/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          message: data.message || "OTP resent successfully!",
        };
      } else {
        throw new Error(data.error || "Failed to resend OTP.");
      }
    } catch {
      throw new Error("Network error. Please try again.");
    }
  };

  const updateProfile = async (
    profileData: Partial<UserProfile>
  ): Promise<UserProfile | null> => {
    if (!token) {
      console.error("❌ No token available for profile update");
      return null;
    }

    try {
      setIsLoading(true);
      console.log("🔄 Updating profile with data:", profileData);

      // Clean data
      const cleanedProfileData: Record<string, any> = {};
      for (const [key, value] of Object.entries(profileData)) {
        if (value !== null && value !== "") {
          cleanedProfileData[key] = value;
        }
      }

      // Send update
      const response = await fetch(
        "https://velo-node-backend.onrender.com/user/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanedProfileData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Profile update failed:", response.status, errorData);
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      console.log("✅ Profile update request successful");

      // Fetch the updated profile from server
      const profileRes = await fetch(
        "https://velo-node-backend.onrender.com/user/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!profileRes.ok) {
        throw new Error(
          `Failed to fetch updated profile: ${profileRes.status}`
        );
      }

      const responseData: ApiResponse<UserProfile> | UserProfile =
        await profileRes.json();

      // unwrap the user data
      const updatedProfile: UserProfile =
        (responseData as ApiResponse<UserProfile>).user ||
        (responseData as UserProfile);

      // Update both state and localStorage
      setUser(updatedProfile);
      localStorage.setItem("user", JSON.stringify(updatedProfile));

      console.log("✅ Profile state and localStorage updated");

      return updatedProfile;
    } catch (error) {
      console.error("❌ Failed to update profile:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to fetch wallet addresses
  const getWalletAddresses = async (): Promise<WalletAddress[]> => {
    if (!token) {
      throw new Error("Authentication required to fetch wallet addresses");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/wallet/addresses/testnet",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet addresses: ${response.status}`);
      }

      const data = await response.json();
      if (data.addresses && Array.isArray(data.addresses)) {
        return data.addresses;
      } else {
        throw new Error("Invalid response format for wallet addresses");
      }
    } catch (error) {
      console.error("Error fetching wallet addresses:", error);
      throw error;
    }
  };

  // Add function to fetch wallet balances
  const getWalletBalances = async (): Promise<WalletBalance[]> => {
    if (!token) {
      throw new Error("Authentication required to fetch wallet balances");
    }

    try {
      console.log("Making API call to fetch wallet balances...");
      console.log("Token length:", token?.length);

      const response = await fetch(
        "https://velo-node-backend.onrender.com/wallet/balances/testnet",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        // Try to get the actual error message from the server
        let errorMessage = `Failed to fetch wallet balances: ${response.status}`;

        try {
          const errorData = await response.json();
          console.log("Error response data:", errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log("Could not parse error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Success response data:", data);

      if (data.balances && Array.isArray(data.balances)) {
        return data.balances;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        throw new Error("Invalid response format for wallet balances");
      }
    } catch (error) {
      console.error("Detailed error fetching wallet balances:", error);
      throw error;
    }
  };

  // Send transaction function
  const sendTransaction = async (
    request: SendMoneyRequest
  ): Promise<SendMoneyResponse> => {
    if (!token) {
      throw new Error("Authentication required to send transaction");
    }

    try {
      console.log("Sending transaction request:", request);

      const response = await fetch(
        "https://velo-node-backend.onrender.com/wallet/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      console.log("Response status:", response.status);

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Failed to send transaction: ${response.status}`;

        try {
          const errorData = await response.json();
          console.log("Error response data:", errorData);

          // Extract the most specific error message available
          if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.log("Could not parse error response:", parseError);
          // Use default error message if parsing fails
        }

        // Create a proper Error object with the message
        const error = new Error(errorMessage);
        (error as any).response = { status: response.status };
        throw error;
      }

      const data = await response.json();
      console.log("Transaction data:", data);
      return data;
    } catch (error) {
      console.error("Error sending transaction:", error);

      // If it's already a properly formatted error, re-throw it
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise, create a new error
      throw new Error(
        typeof error === "string"
          ? error
          : "An unexpected error occurred while sending transaction"
      );
    }
  };

  // Notification functions
  const getNotifications = async (
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<NotificationsResponse> => {
    if (!token) {
      throw new Error("Authentication required to fetch notifications");
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(unreadOnly && { unreadonly: "true" }),
      });

      const response = await fetch(
        `https://velo-node-backend.onrender.com/notification?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  };

  const getUnreadCount = async (): Promise<number> => {
    if (!token) {
      throw new Error("Authentication required to fetch unread count");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/notification/count",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.status}`);
      }

      const data: UnreadCountResponse = await response.json();
      return data.unreadCount;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  };

  const markNotificationAsRead = async (
    notificationId: string
  ): Promise<MarkAsReadResponse> => {
    if (!token) {
      throw new Error("Authentication required to mark notification as read");
    }

    try {
      const response = await fetch(
        `https://velo-node-backend.onrender.com/notification/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark notification as read: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  const markAllNotificationsAsRead = async (): Promise<{ message: string }> => {
    if (!token) {
      throw new Error(
        "Authentication required to mark all notifications as read"
      );
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/notification/read-all",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark all notifications as read: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };

  // Notification creation functions
  const createSendMoneyNotification = async (
    data: SendMoneyNotificationData
  ): Promise<{ message: string }> => {
    if (!token) {
      throw new Error("Authentication required to create notification");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/notification/send-money",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create send money notification: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating send money notification:", error);
      throw error;
    }
  };

  const createReceiveMoneyNotification = async (
    data: ReceiveMoneyNotificationData
  ): Promise<{ message: string }> => {
    if (!token) {
      throw new Error("Authentication required to create notification");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/notification/receive-money",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create receive money notification: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating receive money notification:", error);
      throw error;
    }
  };

  const createSwapNotification = async (
    data: SwapNotificationData
  ): Promise<{ message: string }> => {
    if (!token) {
      throw new Error("Authentication required to create notification");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/notification/swap",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create swap notification: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating swap notification:", error);
      throw error;
    }
  };

  // Transaction history function
  const getTransactionHistory = async (
    page: number = 1,
    limit: number = 20,
    chain?: string,
    type?: string
  ): Promise<TransactionHistoryResponse> => {
    if (!token) {
      throw new Error("Authentication required to fetch transaction history");
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(chain && { chain }),
        ...(type && { type }),
      });

      const response = await fetch(
        `https://velo-node-backend.onrender.com/history?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch transaction history: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("transaction history data ", data.transactions);
      return data;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  };

  // Deposit check function
  const checkDeposits = async (): Promise<DepositCheckResponse> => {
    if (!token) {
      throw new Error("Authentication required to check deposits");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/wallet/check-deposits",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check deposits: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking deposits:", error);
      throw error;
    }
  };
  const checkDeploy = async (): Promise<DepositCheckResponse> => {
    if (!token) {
      throw new Error("Authentication required to check deplow");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/checkdeploy/balances/testnet/deploy",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check deploy: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking deploy:", error);
      throw error;
    }
  };

  const createSplitPayment = async (
    data: CreateSplitPaymentRequest
  ): Promise<CreateSplitPaymentResponse> => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/split-payment/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create split payment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating split payment:", error);
      throw error;
    }
  };

  const executeSplitPayment = async (
    id: string
  ): Promise<ExecuteSplitPaymentResponse> => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch(
        `https://velo-node-backend.onrender.com/split-payment/${id}/execute`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to execute split payment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error executing split payment:", error);
      throw error;
    }
  };

  const getSplitPaymentTemplates = async (params?: {
    status?: string;
  }): Promise<TemplatesResponse> => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const queryParams = params?.status ? `?status=${params.status}` : "";
      const response = await fetch(
        `https://velo-node-backend.onrender.com/split-payment/templates${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get templates: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting templates:", error);
      throw error;
    }
  };

  const getExecutionHistory = async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<ExecutionHistoryResponse> => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const urlParams = new URLSearchParams();
      if (params?.page) urlParams.append("page", params.page.toString());
      if (params?.limit) urlParams.append("limit", params.limit.toString());
      const query = urlParams.toString() ? `?${urlParams.toString()}` : "";
      const response = await fetch(
        `https://velo-node-backend.onrender.com/split-payment/${id}/executions${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get execution history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting execution history:", error);
      throw error;
    }
  };

  const toggleSplitPaymentStatus = async (
    id: string
  ): Promise<ToggleSplitPaymentResponse> => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch(
        `https://velo-node-backend.onrender.com/split-payment/${id}/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to toggle status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error toggling status:", error);
      throw error;
    }
  };

  const createMerchantPayment = async (
    requestBody: CreateMerchantPaymentRequest
  ): Promise<CreateMerchantPaymentResponse> => {
    if (!token) {
      throw new Error("Authentication required to create merchant payment");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/merchant/payments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create merchant payment: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating merchant payment:", error);
      throw error;
    }
  };

  const getMerchantPaymentStatus = async (
    paymentId: string
  ): Promise<GetMerchantPaymentStatusResponse> => {
    if (!token) {
      throw new Error("Authentication required to get merchant payment status");
    }

    try {
      // Clean up the payment ID - remove any spaces
      const cleanPaymentId = paymentId.replace(/\s+/g, "");

      const response = await fetch(
        `https://velo-node-backend.onrender.com/merchant/payments/${cleanPaymentId}/monitor`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get merchant payment status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting merchant payment status:", error);
      throw error;
    }
  };

  const payMerchantInvoice = async (
    paymentId: string,
    fromAddress: string
  ): Promise<any> => {
    if (!token) {
      throw new Error("Authentication required to pay merchant invoice");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/merchant/pay",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentId, fromAddress }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to pay merchant invoice: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error paying merchant invoice:", error);
      throw error;
    }
  };

  const getMerchantPaymentHistory = async (params?: {
    merchantId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<GetMerchantPaymentHistoryResponse> => {
    if (!token) {
      throw new Error(
        "Authentication required to get merchant payment history"
      );
    }

    try {
      const urlParams = new URLSearchParams();
      if (params?.merchantId) urlParams.append("merchantId", params.merchantId);
      if (params?.status) urlParams.append("status", params.status);
      if (params?.page) urlParams.append("page", params.page.toString());
      if (params?.limit) urlParams.append("limit", params.limit.toString());
      const query = urlParams.toString() ? `?${urlParams.toString()}` : "";

      const response = await fetch(
        `https://velo-node-backend.onrender.com/merchant/payments${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get merchant payment history: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting merchant payment history:", error);
      throw error;
    }
  };

  const getMerchantPaymentStats = async (): Promise<{
    stats: {
      total: number;
      pending: number;
      completed: number;
      cancelled: number;
      totalAmount: string;
    };
  }> => {
    if (!token) {
      throw new Error("Authentication required to get merchant payment stats");
    }

    try {
      const response = await fetch(
        "https://velo-node-backend.onrender.com/merchant/payments/stats",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get merchant payment stats: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting merchant payment stats:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    updateProfile,
    getWalletAddresses,
    getWalletBalances,
    fetchUserProfile,
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createSendMoneyNotification,
    createReceiveMoneyNotification,
    createSwapNotification,
    getTransactionHistory,
    checkDeposits,
    sendTransaction,
    createSplitPayment,
    executeSplitPayment,
    getSplitPaymentTemplates,
    getExecutionHistory,
    toggleSplitPaymentStatus,
    createMerchantPayment,
    getMerchantPaymentStatus,
    payMerchantInvoice,
    getMerchantPaymentHistory,
    checkDeploy,
    getMerchantPaymentStats,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
