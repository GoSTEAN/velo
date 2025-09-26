"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tokenManager } from '@/components/lib/api';

// Add interface for wallet address
interface WalletAddress {
  chain: string;
  address: string;
}

// Add interface for API responses that might wrap user data
interface ApiResponse<T> {
  user?: T;
  [key: string]: any;
}

// Create UserProfile interface directly in AuthContext
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
  // Add new fields
  username: string | null;
  displayPicture: string | null;
  // ✅ ADD these nested structures instead
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName?: string; // Optional if not always present
  } | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (email: string, password: string) => Promise<{ success: boolean; }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile | null>;
  getWalletAddresses: () => Promise<WalletAddress[]>;
  fetchUserProfile: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
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

  const fetchUserProfile = async (authToken: string) => {
    try {
      console.log('🔄 Fetching user profile with token...');

      const profileRes = await fetch(
        'https://velo-node-backend.onrender.com/user/profile',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!profileRes.ok) {
        throw new Error(`Failed to fetch profile: ${profileRes.status}`);
      }

      const responseData: ApiResponse<UserProfile> | UserProfile = await profileRes.json();


      // 🔧 FIX: Handle wrapped user data
      const userProfile: UserProfile = (responseData as ApiResponse<UserProfile>).user || (responseData as UserProfile);


      setUser(userProfile);
      // Store in localStorage immediately after setting user
      localStorage.setItem("user", JSON.stringify(userProfile));

    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      // Clear invalid token
      tokenManager.clearToken();
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 SIMPLIFIED: Initial load effect
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');

      const savedToken = tokenManager.getToken();
      const savedUser = localStorage.getItem("user");

      if (savedToken) {
        console.log('📱 Found saved token and user');
        setToken(savedToken);

        // Only use saved user as temporary data while fetching fresh data
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);

            // Handle nested user data from localStorage
            const userData = parsedUser.user || parsedUser;

            setUser(userData);
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem("user");
          }
        }

        // Always fetch fresh profile data
        await fetchUserProfile(savedToken);
      } else {
        console.log('❌ No saved token found');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const authRes = await fetch(
        'https://velo-node-backend.onrender.com/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const authData = await authRes.json();

      if (!authRes.ok) {
        throw new Error(authData.error || authData.message || 'Login failed');
      }

      // Extract the accessToken from the response
      const receivedToken = authData.accessToken;

      if (receivedToken) {
        console.log('🎫 Token received, storing...');
        tokenManager.setToken(receivedToken);
        setToken(receivedToken);

        // Also set the user data from the login response if available
        if (authData.user) {
          console.log('👤 User data from login:', authData.user);
          const userData: UserProfile = (authData.user as ApiResponse<UserProfile>).user || (authData.user as UserProfile);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setIsLoading(false);
        } else {
          // Only fetch profile if user data isn't in login response
          await fetchUserProfile(receivedToken);
        }

        return true;
      }

      throw new Error('No access token received from server');

    } catch (err) {
      setIsLoading(false);
      console.error('❌ Login error:', err);
      throw err;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    tokenManager.removeToken();
    localStorage.removeItem("user");
    sessionStorage.removeItem('decryptedWallets');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; }> => {
    try {
      // Register user with backend (only email and password)
      const res = await fetch(
        'https://velo-node-backend.onrender.com/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(
        'https://velo-node-backend.onrender.com/auth/verify-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || 'Verification successful!' };
      } else {
        throw new Error(data.error || 'Verification failed.');
      }
    } catch {
      throw new Error('Network error. Please try again.');
    }
  };

  const resendOtp = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(
        'https://velo-node-backend.onrender.com/auth/resend-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || 'OTP resent successfully!' };
      } else {
        throw new Error(data.error || 'Failed to resend OTP.');
      }
    } catch {
      throw new Error('Network error. Please try again.');
    }
  };


  const updateProfile = async (
    profileData: Partial<UserProfile>
  ): Promise<UserProfile | null> => {
    if (!token) {
      console.error('❌ No token available for profile update');
      return null;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Updating profile with data:', profileData);

      // Clean data
      const cleanedProfileData: Record<string, any> = {};
      for (const [key, value] of Object.entries(profileData)) {
        if (value !== null && value !== '') {
          cleanedProfileData[key] = value;
        }
      }



      // Send update
      const response = await fetch(
        'https://velo-node-backend.onrender.com/user/profile',
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedProfileData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Profile update failed:', response.status, errorData);
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      console.log('✅ Profile update request successful');

      // ✅ Fetch the updated profile from server
      const profileRes = await fetch(
        'https://velo-node-backend.onrender.com/user/profile',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!profileRes.ok) {
        throw new Error(`Failed to fetch updated profile: ${profileRes.status}`);
      }

      const responseData: ApiResponse<UserProfile> | UserProfile = await profileRes.json();


      // unwrap the user data
      const updatedProfile: UserProfile = (responseData as ApiResponse<UserProfile>).user || (responseData as UserProfile);


      // Update both state and localStorage
      setUser(updatedProfile);
      localStorage.setItem("user", JSON.stringify(updatedProfile));

      console.log('✅ Profile state and localStorage updated');

      return updatedProfile;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to fetch wallet addresses
  const getWalletAddresses = async (): Promise<WalletAddress[]> => {
    if (!token) {
      throw new Error('Authentication required to fetch wallet addresses');
    }

    try {
      const response = await fetch(
        'https://velo-node-backend.onrender.com/wallet/addresses/testnet',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
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
        throw new Error('Invalid response format for wallet addresses');
      }
    } catch (error) {
      console.error('Error fetching wallet addresses:', error);
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
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};