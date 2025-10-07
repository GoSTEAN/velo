import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { useToastNotifications } from "./useToastNotifications ";
import { BackendNotification, FrontendNotification } from "@/types/index";

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
  const { toasts, addToast, removeToast, clearAllToasts } =
    useToastNotifications();
  const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    token,
  } = useAuth();
  const [notifications, setNotifications] = useState<FrontendNotification[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useRef to track shown notifications - persists across renders without causing re-renders
  const shownNotificationIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load viewed notification IDs from localStorage on mount
  useEffect(() => {
    const storedIds = localStorage.getItem("viewedNotificationIds");
    if (storedIds) {
      try {
        const parsedIds = JSON.parse(storedIds);
        if (Array.isArray(parsedIds)) {
          shownNotificationIds.current = new Set(parsedIds);
        }
      } catch (error) {
        console.error("Error parsing viewed notification IDs:", error);
      }
    }
  }, []);

  // Save viewed notification IDs to localStorage
  const saveViewedNotificationIds = useCallback(() => {
    localStorage.setItem(
      "viewedNotificationIds",
      JSON.stringify([...shownNotificationIds.current])
    );
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(
    async (
      page: number = 1,
      limit: number = 50,
      unreadOnly: boolean = false
    ) => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getNotifications(page, limit, unreadOnly);

        // Transform backend notifications to frontend format
        const transformedNotifications = response.notifications.map(
          transformBackendNotification
        );

        // Detect new notifications for toasts
        detectNewNotifications(transformedNotifications);

        setNotifications(transformedNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications");
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    },
    [getNotifications, token]
  );

  // Detect new notifications and show toasts
  const detectNewNotifications = useCallback(
    (newNotifications: FrontendNotification[]) => {
      if (newNotifications.length === 0) return;

      // On initial mount, mark all existing notifications as "shown" to prevent toasting old notifications
      if (isInitialMount.current) {
        newNotifications.forEach((notif) => {
          shownNotificationIds.current.add(notif.id);
        });
        saveViewedNotificationIds();
        isInitialMount.current = false;
        return;
      }

      // Find truly NEW notifications - ones we haven't shown before
      const newUnseenNotifications = newNotifications.filter(
        (notif) => !shownNotificationIds.current.has(notif.id)
      );

      showNewToasts(newUnseenNotifications);
    },
    [saveViewedNotificationIds]
  );

  // Show new toasts
  const showNewToasts = useCallback(
    (newNotifications: FrontendNotification[]) => {
      if (newNotifications.length > 0) {
        // Sort by timestamp to show newest first
        const sortedNew = [...newNotifications].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        // Show top 3 newest notifications
        const toShow = sortedNew.slice(0, 3);

        toShow.forEach((notif) => {
          addToast(notif);
          shownNotificationIds.current.add(notif.id);
          saveViewedNotificationIds();
        });
      }
    },
    [addToast, saveViewedNotificationIds]
  );

  // Start automatic polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications(1, 50);
    }, 10000); // Poll every 10 seconds

    // Return cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications]);

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

    // Cleanup polling on unmount
    return cleanup;
  }, [startPolling]);

  // Smart polling - pause when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Refresh immediately when tab becomes visible
        fetchNotifications(1, 50);
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications, startPolling, stopPolling]);

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);

      // Update local state optimistically
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true, isRead: true } : notif
        )
      );
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
      await markAllNotificationsAsRead();

      // Update local state optimistically
      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          read: true,
          isRead: true,
        }))
      );

      // Also clear any active toasts since they're now read
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
    return fetchNotifications(1, 50);
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications: refreshNotifications,
    markAsRead,
    markAllAsRead,
    loadFromLocalStorage,
    toasts,
    removeToast,
    clearAllToasts,
    startPolling,
    stopPolling,
  };
};
