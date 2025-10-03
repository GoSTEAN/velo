import { useState, useCallback } from "react";
import { FrontendNotification } from "@/types";

export const useToastNotifications = () => {
  const [toasts, setToasts] = useState<FrontendNotification[]>([]);
  
  // Remove lastNotificationId - use the Set from useNotifications instead
  const addToast = useCallback((notification: FrontendNotification) => {
    setToasts((prev) => {
      // Prevent duplicates based on ID
      if (prev.some(toast => toast.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev].slice(0, 3);
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };
};