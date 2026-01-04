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
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
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
  updateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
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
        const txResp = await apiClient.getTransactionHistory({ page: 1, limit: 50 });
        // sessionStorage write removed as consumption was removed from useTransactions
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

      // Mark auth as initializing so background refreshes don't run until
      // we've validated any existing token. This prevents background
      // requests from causing 401/clears while the app finishes startup.
      if (typeof window !== "undefined") {
        (window as any).__VELO_AUTH_INITIALIZING = true;
      }

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
      // Auth initialization complete; allow background refreshes
      if (typeof window !== "undefined") {
        (window as any).__VELO_AUTH_INITIALIZING = false;
        // Notify listeners waiting to start background fetches
        window.dispatchEvent(new CustomEvent("velo:authReady"));
      }
    };

    initializeAuth();
  }, []);

  // Sync NextAuth session token into tokenManager so existing apiClient usage continues working
  const { data: nextAuthSession } = useSession();
  useEffect(() => {
    // Debug incoming NextAuth session for diagnostics
    if (nextAuthSession) console.debug("NextAuth session arrived:", nextAuthSession);

    // If NextAuth provided an accessToken, follow the normal sync/validate flow.
    if (nextAuthSession && (nextAuthSession as any).accessToken) {
      // If we recently recorded a 401 (another request failed) then avoid
      // immediately persisting/syncing the NextAuth token. This prevents a
      // quick clear->resync redirect loop. If a 401 happened very recently,
      // sign out the NextAuth session so the client doesn't re-sync it.
      try {
        const last401 = (typeof window !== "undefined" && (window as any).__VELO_LAST_401_TS) as number | undefined;
        if (last401 && Date.now() - last401 < 5000) {
          // Clear NextAuth session and redirect the user to login to break the loop
          signOut({ callbackUrl: "/auth/login" });
          return;
        }
      } catch (e) {
        // ignore
      }
      const at = (nextAuthSession as any).accessToken as string;

      // Prevent other components from reacting to the new token immediately
      // while we validate it. Set the initializing flag and loading state
      // BEFORE persisting the token so any listeners that check `token` will
      // either wait or see that we're still initializing.
      if (typeof window !== "undefined") {
        (window as any).__VELO_AUTH_INITIALIZING = true;
      }
      setIsLoading(true);

      // Prefer backend-provided access token expiry when available. The
      // NextAuth JWT callback may include `accessTokenExpires` (ms timestamp)
      // if the backend returned expiresIn/expiresAt during the provider
      // exchange. Fall back to NextAuth's session.expires when needed.
      const accessTokenExpires = (nextAuthSession as any).accessTokenExpires as
        | number
        | string
        | undefined;
      const sessionExpires = (nextAuthSession as any).expires as string | undefined;

      if (accessTokenExpires) {
        // accessTokenExpires is stored as an absolute millisecond timestamp
        const msUntil = typeof accessTokenExpires === "number"
          ? accessTokenExpires - Date.now()
          : Date.parse(String(accessTokenExpires)) - Date.now();
        const minutes = Math.max(1, Math.ceil(msUntil / (60 * 1000)));
        tokenManager.setToken(at, minutes);
      } else if (sessionExpires) {
        const msUntil = Date.parse(sessionExpires) - Date.now();
        const minutes = Math.max(1, Math.ceil(msUntil / (60 * 1000)));
        tokenManager.setToken(at, minutes);
      } else {
        tokenManager.setToken(at);
      }

      // Make token available in state so components can render, but they
      // should avoid firing API calls while __VELO_AUTH_INITIALIZING is set.
      setToken(at);

      // If user data provided by NextAuth session, sync it too
      if ((nextAuthSession as any).user) {
        const incomingUser = (nextAuthSession as any).user;
        setUser(incomingUser);
        try {
          localStorage.setItem("user", JSON.stringify(incomingUser));
        } catch (e) {
          // ignore storage errors
        }

        // If the NextAuth session already contains a reasonably-complete
        // user profile (username, firstName, or displayPicture), trust that
        // payload and skip the immediate GET /user/profile. Skipping avoids
        // an extra request that could return 401 and prematurely clear the
        // token during initialization. We still warm the wallet cache.
        const hasProfileFields = Boolean(
          incomingUser && (incomingUser.username || incomingUser.firstName || incomingUser.displayPicture)
        );

        if (hasProfileFields) {
          // We trust the provided profile and finish initialization now.
          if (typeof window !== "undefined") {
            (window as any).__VELO_AUTH_INITIALIZING = false;
            window.dispatchEvent(new CustomEvent("velo:authReady"));
          }
          setIsLoading(false);
          // Warm wallet cache in background
          void warmWalletCache();
        } else {
          // Profile is incomplete; fetch a fresh profile to validate token
          (async () => {
            try {
              await fetchUserProfile(at);
            } catch (e) {
              console.warn("NextAuth token validation failed:", e);
            } finally {
              if (typeof window !== "undefined") {
                (window as any).__VELO_AUTH_INITIALIZING = false;
                window.dispatchEvent(new CustomEvent("velo:authReady"));
              }
              setIsLoading(false);
            }
          })();
        }
      } else {
        // No user info provided; still validate token to be safe
        (async () => {
          try {
            await fetchUserProfile(at);
          } catch (e) {
            console.warn("NextAuth token validation failed:", e);
          } finally {
            if (typeof window !== "undefined") {
              (window as any).__VELO_AUTH_INITIALIZING = false;
            }
            setIsLoading(false);
          }
        })();
      }
    }
    // If NextAuth session exists but doesn't include an accessToken, attempt
    // to recover by using any token already stored in tokenManager (for
    // example when the user previously updated their profile and the
    // NextAuth exchange didn't return a fresh token). This lets the app
    // fetch the existing profile without forcing sign-in again.
    else if (nextAuthSession && !(nextAuthSession as any).accessToken) {
      try {
        const stored = tokenManager.getToken();
        if (stored) {
          console.debug("NextAuth session missing accessToken — using stored token to validate profile");
          if (typeof window !== "undefined") (window as any).__VELO_AUTH_INITIALIZING = true;
          setIsLoading(true);
          setToken(stored);
          // If NextAuth provided user object, set it as temporary data
          if ((nextAuthSession as any).user) {
            setUser((nextAuthSession as any).user);
            try {
              localStorage.setItem("user", JSON.stringify((nextAuthSession as any).user));
            } catch (e) { }
          }
          (async () => {
            try {
              await fetchUserProfile(stored);
              void warmWalletCache();
            } catch (e) {
              console.warn("Fallback token validation failed:", e);
            } finally {
              if (typeof window !== "undefined") {
                (window as any).__VELO_AUTH_INITIALIZING = false;
                window.dispatchEvent(new CustomEvent("velo:authReady"));
              }
              setIsLoading(false);
            }
          })();
        }
      } catch (e) {
        // ignore
      }
    }
  }, [nextAuthSession]);

  // When NextAuth session becomes available, redirect the user to dashboard
  // if they're currently on an auth page. This handles the case where
  // NextAuth has completed the OAuth flow and the app needs to navigate
  // from the login/signup UI to the authenticated area.
  useEffect(() => {
    // Only redirect to dashboard after NextAuth session is available AND
    // local auth initialization/validation has completed. This avoids
    // briefly navigating to the dashboard and then being redirected back
    // because the token was invalidated by background requests.
    if (nextAuthSession && (nextAuthSession as any).accessToken && !isLoading) {
      try {
        if (typeof window !== "undefined") {
          const path = window.location.pathname || "";
          // Only redirect to dashboard if the user is currently on an auth page.
          // Do NOT treat the root path ("/") as an auth page to avoid
          // unintentional redirects from the public landing page.
          if (path.startsWith("/auth")) {
            router.push("/dashboard");
          }
        }
      } catch (e) {
        // ignore navigation errors
      }
    }
  }, [nextAuthSession, router, isLoading]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Allow a slightly longer timeout for login to tolerate temporary slow backend responses
      const authData = await apiClient.login({ email, password }, 30000);
      const receivedToken = authData.accessToken;

      if (receivedToken) {
        console.log("Token received, storing...");
        // If backend provided an expiration hint (e.g., expiresIn or expiresAt),
        // persist that; otherwise fall back to tokenManager default.
        const expiresInMinutes = (authData as any)?.expiresIn
          ? Number((authData as any).expiresIn) / 60
          : (authData as any)?.expiresAt
            ? Math.max(1, Math.ceil((Date.parse((authData as any).expiresAt) - Date.now()) / (60 * 1000)))
            : undefined;

        if (expiresInMinutes) {
          tokenManager.setToken(receivedToken, expiresInMinutes);
        } else {
          tokenManager.setToken(receivedToken);
        }

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
  ): Promise<UserProfile> => {
    // Read token directly from tokenManager to avoid stale closure values
    let currentToken = tokenManager.getToken();

    // If no token in storage, but NextAuth session provides one, use it and persist
    const nextAuthToken = (nextAuthSession as any)?.accessToken as string | undefined;
    if (!currentToken && nextAuthToken) {
      console.log("Found NextAuth accessToken, persisting to tokenManager");
      tokenManager.setToken(nextAuthToken);
      setToken(nextAuthToken);
      currentToken = nextAuthToken;
    }

    if (!currentToken) {
      console.error("No token available for profile update");
      throw new Error("Authentication required to update profile. Please login again.");
    }

    try {
      setIsLoading(true);
      // Diagnostic logs to help troubleshoot update failures
      const nextAuthTokenDebug = (nextAuthSession as any)?.accessToken;
      console.log("Updating profile with data:", profileData);
      console.debug("updateProfile: currentToken (from tokenManager):", currentToken);
      console.debug("updateProfile: nextAuth accessToken (if any):", nextAuthTokenDebug);

      // Clean data
      const cleanedProfileData: Record<string, any> = {};
      for (const [key, value] of Object.entries(profileData)) {
        if (value !== null && value !== "") {
          cleanedProfileData[key] = value;
        }
      }

      // Send update using API client
      console.debug("updateProfile: cleanedProfileData to send:", cleanedProfileData);
      const rawResult = await apiClient.updateUserProfile(cleanedProfileData);

      // Normalize common backend shapes: { user }, { data: {...} }, or direct user object
      const maybe = rawResult as any;
      const updatedProfile = maybe && (maybe.user || maybe.data || maybe);

      if (!updatedProfile) {
        throw new Error("Server returned empty profile");
      }

      // Update both state and localStorage with the normalized profile
      setUser(updatedProfile as any);
      try {
        localStorage.setItem("user", JSON.stringify(updatedProfile));
      } catch (e) {
        // ignore localStorage failures
      }

      console.log("Profile state and localStorage updated");

      return updatedProfile;
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Rethrow so callers receive the original error and can show server messages
      throw error;
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