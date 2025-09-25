"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tokenManager } from '@/components/lib/api';

// Add interface for wallet address
interface WalletAddress {
  chain: string;
  address: string;
}

// Add interface for wallet balance
interface WalletBalance {
  chain: string;
  network: string;
  address: string;
  balance: string;
  symbol: string;
}

// Add interfaces for notifications
interface Notification {
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: PaginationInfo;
}

interface UnreadCountResponse {
  unreadCount: number;
}

interface MarkAsReadResponse {
  message: string;
  notification: {
    id: string;
    isRead: boolean;
  };
}

// Create UserProfile interface directly in AuthContext
interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  isEmailVerified: boolean;
  kyc: any | null;
  kycStatus: string;
  createdAt: string;
  // Add other fields as needed from your backend response
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
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  getWalletAddresses: () => Promise<WalletAddress[]>;
  getWalletBalances: () => Promise<WalletBalance[]>;
  fetchUserProfile: (token: string) => Promise<void>;
  // Notification functions
  getNotifications: (page?: number, limit?: number, unreadOnly?: boolean) => Promise<NotificationsResponse>;
  getUnreadCount: () => Promise<number>;
  markNotificationAsRead: (notificationId: string) => Promise<MarkAsReadResponse>;
  markAllNotificationsAsRead: () => Promise<{ message: string }>;
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

  const fetchUserProfile = async (token: string) => {
    try {
      // console.log('Fetching user profile with token...');
      
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
        throw new Error(`Failed to fetch profile: ${profileRes.status}`);
      }

      const userProfile: UserProfile = await profileRes.json();
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Clear invalid token
      tokenManager.clearToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = tokenManager.getToken();
    if (savedToken) {
      setToken(savedToken);
      // Fetch user profile
      fetchUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // console.log('Sending login request for:', email);
      
      const authRes = await fetch(
        'https://velo-node-backend.onrender.com/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      // console.log('Login response status:', authRes.status);
      
      const authData = await authRes.json();

      if (!authRes.ok) {
        throw new Error(authData.error || authData.message || 'Login failed');
      }

      // Extract the accessToken from the response
      const receivedToken = authData.accessToken;
      
      if (receivedToken) {
        // console.log('Token found');
        tokenManager.setToken(receivedToken);
        setToken(receivedToken);
        
        // Also set the user data from the login response if available
        if (authData.user) {
          setUser(authData.user);
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
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = () => {
    tokenManager.removeToken();
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('decryptedWallets');
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
    } catch  {
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
    } catch  {
      throw new Error('Network error. Please try again.');
    }
  };

  // In AuthContext.tsx, update the updateProfile function:
const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
  if (!token) return false;
  
  try {
    // Filter out null values and empty strings, convert them to undefined
    const cleanedProfileData: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(profileData)) {
      if (value !== null && value !== '') {
        cleanedProfileData[key] = value;
      }
    }

    const response = await fetch(
      'https://velo-node-backend.onrender.com/user/profile', // Correct endpoint
      {
        method: 'PUT', // Correct method
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedProfileData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    const updatedProfile: UserProfile = await response.json();
    setUser(updatedProfile);
    return true;
  } catch (error) {
    console.error('Failed to update profile:', error);
    return false;
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

  // Add function to fetch wallet balances
  const getWalletBalances = async (): Promise<WalletBalance[]> => {
    if (!token) {
      throw new Error('Authentication required to fetch wallet balances');
    }

    try {
      const response = await fetch(
        'https://velo-node-backend.onrender.com/wallet/balances/testnet',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet balances: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.balances && Array.isArray(data.balances)) {
        return data.balances;
      } else {
        throw new Error('Invalid response format for wallet balances');
      }
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      throw error;
    }
  };

  // Notification functions
  const getNotifications = async (
    page: number = 1, 
    limit: number = 20, 
    unreadOnly: boolean = false
  ): Promise<NotificationsResponse> => {
    if (!token) {
      throw new Error('Authentication required to fetch notifications');
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(unreadOnly && { unreadonly: "true" })
      });

      const response = await fetch(
        `https://velo-node-backend.onrender.com/notification?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  };

  const getUnreadCount = async (): Promise<number> => {
    if (!token) {
      throw new Error('Authentication required to fetch unread count');
    }

    try {
      const response = await fetch(
        'https://velo-node-backend.onrender.com/notification/count',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.status}`);
      }

      const data: UnreadCountResponse = await response.json();
      return data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<MarkAsReadResponse> => {
    if (!token) {
      throw new Error('Authentication required to mark notification as read');
    }

    try {
      const response = await fetch(
        `https://velo-node-backend.onrender.com/notification/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllNotificationsAsRead = async (): Promise<{ message: string }> => {
    if (!token) {
      throw new Error('Authentication required to mark all notifications as read');
    }

    try {
      const response = await fetch(
        'https://velo-node-backend.onrender.com/notification/read-all',
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};