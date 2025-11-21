"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { tokenManager } from "@/components/lib/api";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import {
  UserProfile,
  SendMoneyRequest,
  SendMoneyResponse,
} from "@/types/authContext";

interface AuthContextType {
  // Auth state
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  
  // Auth methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (email: string, password: string) => Promise<{ success: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile | null>;
  fetchUserProfile: (token: string) => Promise<void>;
  
  // ONLY KEEP sendTransaction since it affects auth state (might update user balance)
  sendTransaction: (request: SendMoneyRequest) => Promise<SendMoneyResponse>;
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

  // console.log("TTTTTTTTTTTTT",token)
  const fetchUserProfile = async (authToken: string) => {
    try {
      console.log("Fetching user profile with token...");

      const userProfile = await apiClient.getUserProfile();
      setUser(userProfile);
      
      // Store in localStorage immediately after setting user
      localStorage.setItem("user", JSON.stringify(userProfile));
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Clear invalid token
      tokenManager.clearToken();
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Warm wallet cache: fetch addresses & balances in parallel and persist
  // them to sessionStorage. This runs non-blocking after login/initialization
  // so the UI can display cached data almost instantly.
  const warmWalletCache = async () => {
    try {
      const [addresses, balances] = await Promise.all([
        apiClient.getWalletAddresses(),
        apiClient.getWalletBalances(),
      ]);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("velo.wallet.addresses", JSON.stringify(addresses));
          sessionStorage.setItem("velo.wallet.balances", JSON.stringify(balances));
        } catch (e) {
          // ignore storage errors
        }
      }
      // Also prefetch recent transactions (page 1) so History can render instantly
      try {
        // Try to prefetch a large slice (effectively 'all' for most users).
        // Using a high limit reduces multiple requests and gives the UI a
        // complete dataset to render instantly. Adjust if backend rejects big limits.
        const txKeyAll = `transactions-all`;
        const txResp = await apiClient.getTransactionHistory({ page: 1, limit: 1000 });
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(txKeyAll, JSON.stringify(txResp));
          } catch (e) {
            // ignore storage errors
          }
        }
      } catch (e) {
        // ignore transaction prefetch failures
        console.warn("Transaction warm cache failed", e);
      }
    } catch (err) {
      // Do not block the UI if this fails; log for diagnostics.
      console.warn("warmWalletCache failed:", err);
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
  // Warm wallet data cache in background to speed up UI (non-blocking)
  void warmWalletCache();
      } else {
        console.log("No saved token found");
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

  // Allow a slightly longer timeout for login to tolerate temporary slow backend responses
  const authData = await apiClient.login({ email, password }, 30000);
      const receivedToken = authData.accessToken;

      if (receivedToken) {
        console.log("Token received, storing...");
        tokenManager.setToken(receivedToken);
        setToken(receivedToken);

        // Also set the user data from the login response if available
        if (authData.user) {
          console.log("👤 User data from login:", authData.user);
          setUser(authData.user);
          localStorage.setItem("user", JSON.stringify(authData.user));
          setIsLoading(false);
          // Warm wallet cache in background so balances/addresses show fast
          void warmWalletCache();
        } else {
          // Only fetch profile if user data isn't in login response
          await fetchUserProfile(receivedToken);
          // After fetching profile, kick off wallet cache warm-up
          void warmWalletCache();
        }

        return true;
      }

      throw new Error("No access token received from server");
    } catch (err) {
      setIsLoading(false);
      console.error("Login error:", err);
      throw err;
    }
  };

  const logout = () => {
    console.log("🚪 Logging out...");
    tokenManager.removeToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem("decryptedWallets");
    
    // Clear all API cache
    apiClient.clearCache();
    
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
      await apiClient.register({ email, password });
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      // Provide a clearer, user-friendly error message for common cases
      const status = (error as any)?.status;
      const serverData = (error as any)?.data;
      if (status === 409) {
        // Conflict usually means user already exists
        const msg = serverData?.message || 'An account with this email already exists.';
        throw new Error(msg);
      }

      // Fall back to server-provided message if available
      const fallback = (error as any)?.message || 'Registration failed. Please try again.';
      throw new Error(fallback);
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await apiClient.verifyOtp({ email, otp });
      return {
        success: true,
        message: result.message || "Verification successful!",
      };
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  };

  const resendOtp = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await apiClient.resendOtp(email);
      return {
        success: true,
        message: result.message || "OTP resent successfully!",
      };
    } catch (error) {
      console.error("Resend OTP error:", error);
      throw error;
    }
  };

  const updateProfile = async (
    profileData: Partial<UserProfile>
  ): Promise<UserProfile | null> => {
    if (!token) {
      console.error("No token available for profile update");
      return null;
    }

    try {
      setIsLoading(true);
      console.log("Updating profile with data:", profileData);

      // Clean data
      const cleanedProfileData: Record<string, any> = {};
      for (const [key, value] of Object.entries(profileData)) {
        if (value !== null && value !== "") {
          cleanedProfileData[key] = value;
        }
      }

      // Send update using API client
      const updatedProfile = await apiClient.updateUserProfile(cleanedProfileData);

      // Update both state and localStorage
      setUser(updatedProfile);
      localStorage.setItem("user", JSON.stringify(updatedProfile));

      console.log("Profile state and localStorage updated");

      return updatedProfile;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async (
    request: SendMoneyRequest
  ): Promise<SendMoneyResponse> => {
    if (!token) {
      throw new Error("Authentication required to send transaction");
    }

    try {
      console.log("Sending transaction request:", request);
      const result = await apiClient.sendTransaction(request);
      console.log("Transaction result:", result);
      return result;
    } catch (error) {
      console.error("Error sending transaction:", error);
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
    fetchUserProfile,
    sendTransaction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};