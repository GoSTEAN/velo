// components/lib/api.ts


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-node-backend.emender.com';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  walletAddresses?: Array<{
    chain: string;
    address: string;
  }>;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Auth API functions
export const authApi = {
  // Register user
  register: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Login user
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Verify OTP
  verifyOtp: async (email: string, otp: string): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  // Resend OTP
  resendOtp: async (email: string): Promise<ApiResponse> => {
    return apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// User API functions (requires authentication)
export const userApi = {
  // Get user profile
  getProfile: async (token: string): Promise<UserProfile> => {
    const response = await apiRequest<UserProfile>('/user/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user profile');
    }
    
    return response.data!;
  },

  // Update user profile
  updateProfile: async (token: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiRequest<UserProfile>('/user/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user profile');
    }
    
    return response.data!;
  },
};

// Token management
// components/lib/tokenManager.ts

export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  },

  clearToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  },
};