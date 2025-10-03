
export interface ApiResponse<T = any> {
  user: import("/home/lawless-pad/Documents/new/swift/swift/components/context/AuthContext").UserProfile;
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


// Token management
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