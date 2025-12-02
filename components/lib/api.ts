
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

  setToken: (token: string, expiresInMinutes: number = 15): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
    // Calculate expiration time based on current time + 15 minutes
    const expirationTime = Date.now() + (expiresInMinutes * 60 * 1000);
    localStorage.setItem('authTokenExpiration', expirationTime.toString());
    try {
      const mins = Math.max(0, Math.ceil((expirationTime - Date.now()) / (60 * 1000)));
      console.log(`tokenManager: token set, expires in ${mins} minute(s)`);
    } catch (e) {
      // ignore logging failures
    }
  },

  clearToken: (): void => {
    if (typeof window === 'undefined') return;
    try {
      const expiration = localStorage.getItem('authTokenExpiration');
      const mins = expiration ? Math.max(0, Math.ceil((parseInt(expiration) - Date.now()) / (60 * 1000))) : 0;
      console.log(`tokenManager: clearing token (minutes left: ${mins}) at ${new Date().toISOString()}`);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiration');
    sessionStorage.removeItem('authToken');
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    try {
      const expiration = localStorage.getItem('authTokenExpiration');
      const mins = expiration ? Math.max(0, Math.ceil((parseInt(expiration) - Date.now()) / (60 * 1000))) : 0;
      console.log(`tokenManager: removing token (minutes left: ${mins}) at ${new Date().toISOString()}`);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiration');
    sessionStorage.removeItem('authToken');
  },

  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    
    const token = localStorage.getItem('authToken');
    const expiration = localStorage.getItem('authTokenExpiration');
    
    // If no token exists, consider it expired
    if (!token) return true;
    
    // If no expiration time but token exists, we don't know - assume valid
    if (!expiration) return false;
    
    // Check if current time is past expiration
    return Date.now() > parseInt(expiration);
  },

  getTimeUntilExpiration: (): number => {
    if (typeof window === 'undefined') return 0;
    const expiration = localStorage.getItem('authTokenExpiration');
    if (!expiration) return 0;
    return Math.max(0, parseInt(expiration) - Date.now());
  },

  // Helper to get expiration time in minutes
  getMinutesUntilExpiration(): number {
    return Math.ceil(this.getTimeUntilExpiration() / (60 * 1000));
  }
};