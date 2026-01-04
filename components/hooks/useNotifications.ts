import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/components/context/AuthContext";
import { useToastNotifications } from "./useToastNotifications ";
import { BackendNotification, FrontendNotification } from "@/types/index";
import { useApiQuery } from "./useApiQuery";

// Type guard to check if a string is a valid category
const isValidCategory = (
  category: string
): category is "today" | "this-week" | "earlier" => {
  return ["today", "this-week", "earlier"].includes(category);
};

// Helper function to categorize notifications based on timestamp
const categorizeNotification = (
  createdAt: string
): "today" | "this-week" | "earlier" => {
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const timeDiff = now.getTime() - notificationDate.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (hoursDiff < 24) return "today";
  if (hoursDiff < 168) return "this-week";
  return "earlier";
};

// Helper function to format time difference
const formatTimeDifference = (createdAt: string): string => {
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const timeDiff = now.getTime() - notificationDate.getTime();

  const minutes = Math.floor(timeDiff / (1000 * 60));
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return notificationDate.toLocaleDateString();
};

// Transform backend notification to frontend format
const transformBackendNotification = (
  backendNotif: BackendNotification
): FrontendNotification => {
  const timestamp = new Date(backendNotif.createdAt);
  const category = categorizeNotification(backendNotif.createdAt);

  return {
    id: backendNotif.id,
    title: backendNotif.title || backendNotif.type,
    description: backendNotif.message,
    time: formatTimeDifference(backendNotif.createdAt),
    category,
    read: backendNotif.isRead,
    timestamp,
    type: backendNotif.type,
    message: backendNotif.message,
    details: backendNotif.details,
    isRead: backendNotif.isRead,
    createdAt: backendNotif.createdAt,
  };
};

export const useNotifications = () => {
  const { toasts, addToast, removeToast, clearAllToasts } = useToastNotifications();
  const { token } = useAuth();

  // Use silent query for notifications - no loading states
  const {
    data: notificationsData,
    error: notificationsError,
    refetch: refetchNotifications
  } = useApiQuery(
    () => apiClient.getNotifications({ page: 1, limit: 1000 }),
    {
      cacheKey: 'notifications-all',
      ttl: 15 * 1000,
      backgroundRefresh: true
    }
  );

  // Use silent query for unread count
  const {
    data: unreadCountData,
    refetch: refetchUnreadCount
  } = useApiQuery(
    () => apiClient.getUnreadCount(),
    {
      cacheKey: 'notifications-unread-count',
      ttl: 10 * 1000,
      backgroundRefresh: true
    }
  );

  const [notifications, setNotifications] = useState<FrontendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXX",notifications)

  // Use useRef to track shown notifications - persists across renders without causing re-renders
  const shownNotificationIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  // Polling interval reference
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start polling for notifications and unread count
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Initial fetch
    if (!document.hidden) {
      refetchUnreadCount();
      refetchNotifications();
    }

    // Poll every 15 seconds
    pollingIntervalRef.current = setInterval(() => {
      if (!document.hidden) {
        refetchUnreadCount();
        refetchNotifications();
      }
    }, 15000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [refetchNotifications, refetchUnreadCount]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Fallback to localStorage data
  const loadFromLocalStorage = useCallback(() => {
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        const validNotifications = parsed
          .map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
            category: isValidCategory(n.category) ? n.category : "earlier",
          }))
          .filter((n: FrontendNotification) => n.timestamp <= new Date());

        setNotifications(validNotifications);
      } catch (error) {
        console.error("Error parsing notifications from localStorage:", error);
      }
    }
  }, []);

  // Initialize notifications and start polling
  useEffect(() => {
    const cleanup = startPolling();
    return cleanup;
  }, [startPolling]);

  // Smart polling - pause when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Refresh immediately when tab becomes visible
        refetchNotifications();
        refetchUnreadCount();
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetchNotifications, refetchUnreadCount, startPolling, stopPolling]);

  const markAsRead = async (id: string) => {
    try {

      await apiClient.markNotificationAsRead(id);

      // Update local state optimistically
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true, isRead: true } : notif
        )
      );

      // Refresh unread count
      refetchUnreadCount();

    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Fallback to local state update
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true, isRead: true } : notif
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {

      await apiClient.markAllNotificationsAsRead();

      // Update local state optimistically
      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          read: true,
          isRead: true,
        }))
      );

      // Refresh unread count
      refetchUnreadCount();

      clearAllToasts();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      // Fallback to local state update
      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          read: true,
          isRead: true,
        }))
      );
      clearAllToasts();
    }
  };

  // Manual refresh function
  const refreshNotifications = useCallback(() => {
    return Promise.all([refetchNotifications(), refetchUnreadCount()]);
  }, [refetchNotifications, refetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    error: notificationsError,
    fetchNotifications: refreshNotifications,
    markAsRead,
    markAllAsRead,
    loadFromLocalStorage,
    toasts,
    removeToast,
    clearAllToasts,
    startPolling: startPolling,
    stopPolling: stopPolling,
  };
};