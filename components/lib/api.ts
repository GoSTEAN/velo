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
  getProfile: async (token: string): Promise<ApiResponse<UserProfile>> => {
    return apiRequest<UserProfile>('/user/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Update user profile
  updateProfile: async (
    token: string,
    profileData: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
    }
  ): Promise<ApiResponse<UserProfile>> => {
    return apiRequest<UserProfile>('/user/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  },

  // Add wallet address
  addWalletAddress: async (
    token: string,
    chain: string,
    address: string
  ): Promise<ApiResponse> => {
    return apiRequest('/user/address', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chain, address }),
    });
  },
};

// Token management
export const tokenManager = {
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },
};