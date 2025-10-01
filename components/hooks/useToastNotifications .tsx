
import { useState, useCallback } from "react";
import { FrontendNotification } from "@/types";

export const useToastNotifications = () => {
  const [toasts, setToasts] = useState<FrontendNotification[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  const addToast = useCallback((notification: FrontendNotification) => {
    // Prevent duplicate toasts
    if (notification.id === lastNotificationId) return;
    
    setLastNotificationId(notification.id);
    setToasts((prev) => [notification, ...prev].slice(0, 3)); 
  }, [lastNotificationId]);

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