// hooks/useTokenMonitor.ts
import { useEffect, useState } from 'react';
import { tokenManager } from '../lib/api';

export const useTokenMonitor = () => {
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);

  useEffect(() => {
    const checkTokenValidity = () => {
      // Check if token exists and is expired based on our frontend timer
      const tokenExists = !!tokenManager.getToken();
      const isExpired = tokenManager.isTokenExpired();
      
      if (tokenExists && isExpired) {
        // Token exists in storage but our frontend timer says it's expired
        setShowExpiredDialog(true);
        tokenManager.clearToken();
      }
      
      // Optional: Log time remaining for debugging
      const minutesLeft = tokenManager.getMinutesUntilExpiration();
      if (minutesLeft > 0) {
        console.log(`Token expires in ${minutesLeft} minutes`);
      }
    };

    // Check immediately on mount
    checkTokenValidity();

    // Check more frequently - every 10 seconds
    const checkInterval = setInterval(checkTokenValidity, 10000);

    // Listen for storage changes (multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'authTokenExpiration') {
        checkTokenValidity();
      }
    };

    // Listen for custom token clear events
    const handleTokenCleared = () => {
      setShowExpiredDialog(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tokenCleared', handleTokenCleared);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenCleared', handleTokenCleared);
    };
  }, []);

  const handleRelogin = () => {
    setShowExpiredDialog(false);
    tokenManager.clearToken();
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  const closeDialog = () => {
    setShowExpiredDialog(false);
  };

  return {
    showExpiredDialog,
    handleRelogin,
    closeDialog
  };
};