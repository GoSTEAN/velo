
import { UserProfile } from "@/types/authContext";

export interface ApiResponse<T = any> {
  user: UserProfile;
  success: boolean;
  dataT: T;
  messageT: string;
}



export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
    // Store token timestamp for expiration check
    localStorage.setItem('authTokenTimestamp', Date.now().toString());
  },

  clearToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenTimestamp');
    sessionStorage.removeItem('authToken');
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenTimestamp');
    sessionStorage.removeItem('authToken');
  },

  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    const timestamp = localStorage.getItem('authTokenTimestamp');
    if (!timestamp) return true;
    
    // Token expires after 24 hours (adjust as needed)
    const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
    return Date.now() - parseInt(timestamp) > TOKEN_EXPIRY_MS;
  }
};