import { useEffect, useState } from 'react';
import { tokenManager } from '../lib/api';
import { signOut } from 'next-auth/react';

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

    // Listen for custom token clear/expired events
    const handleTokenCleared = () => {
      setShowExpiredDialog(true);
    };

    const handleTokenExpiredEarly = () => {
      // A 401 occurred during initialization. Show the expired dialog but
      // don't proactively clear the token here — the AuthContext's
      // validation flow will clear tokens in a controlled way.
      setShowExpiredDialog(true);
    };

    window.addEventListener('storage', handleStorageChange);
    // api-client dispatches 'tokenExpired' when it receives a 401 and clears the token.
    // Some other parts of the app may dispatch 'tokenCleared' — listen to both for robustness.
    window.addEventListener('tokenCleared', handleTokenCleared);
    window.addEventListener('tokenExpired', handleTokenCleared as EventListener);
    // tokenExpiredEarly is emitted when a 401 happens while auth is still
    // initializing; treat it like an expired signal but avoid clearing token
    // here to prevent re-sync loops.
    window.addEventListener('tokenExpiredEarly', handleTokenExpiredEarly as EventListener);

    return () => {
      clearInterval(checkInterval);
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('tokenCleared', handleTokenCleared);
  window.removeEventListener('tokenExpired', handleTokenCleared as EventListener);
  window.removeEventListener('tokenExpiredEarly', handleTokenExpiredEarly as EventListener);
    };
  }, []);

  const handleRelogin = () => {
    setShowExpiredDialog(false);
    // Clear our local token and also sign out the NextAuth session so the
    // client doesn't immediately re-sync a NextAuth-provided token and
    // recreate the same expired-token loop.
    try {
      tokenManager.clearToken();
    } catch (e) {
      // ignore
    }
    // Use next-auth signOut to ensure server-side/session cookies are cleared
    // and then redirect the user to the login page.
    signOut({ callbackUrl: '/auth/login' });
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