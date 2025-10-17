import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/components/context/AuthContext";
import { useToastNotifications } from "./useToastNotifications ";
import { BackendNotification, FrontendNotification } from "@/types/index";
import { useSilentQuery } from "./useSilentQuery";

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
  } = useSilentQuery(
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
  } = useSilentQuery(
    () => apiClient.getUnreadCount(),
    { 
      cacheKey: 'notifications-unread-count',
      ttl: 10 * 1000, 
      backgroundRefresh: true 
    }
  );

  const [notifications, setNotifications] = useState<FrontendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Use useRef to track shown notifications - persists across renders without causing re-renders
  const shownNotificationIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rapidPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Process notifications data from silent query
  useEffect(() => {
    if (notificationsData) {
      
      // Transform backend notifications to frontend format
      const transformedNotifications = (notificationsData.notifications || []).map(
        transformBackendNotification
      );

      // Detect new notifications for toasts
      detectNewNotifications(transformedNotifications);

      setNotifications(transformedNotifications);
    }
  }, [notificationsData]);

  // Process unread count data from silent query
  useEffect(() => {
    if (unreadCountData !== undefined && unreadCountData !== null) {
      setUnreadCount(unreadCountData);
    }
  }, [unreadCountData]);

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

  // Start rapid polling for real-time notifications (every 3 seconds when tab is active)
  const startRapidPolling = useCallback(() => {
    if (rapidPollingIntervalRef.current) {
      clearInterval(rapidPollingIntervalRef.current);
    }


    rapidPollingIntervalRef.current = setInterval(() => {
      if (!document.hidden) {
        refetchUnreadCount();
        
        if (Math.random() < 0.3) { 
          refetchNotifications();
        }
      }
    }, 3000);

    return () => {
      if (rapidPollingIntervalRef.current) {
        clearInterval(rapidPollingIntervalRef.current);
        rapidPollingIntervalRef.current = null;
      }
    };
  }, [refetchNotifications, refetchUnreadCount]);

  // Start normal polling (every 30 seconds as fallback)
  const startNormalPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }


    pollingIntervalRef.current = setInterval(() => {
      if (!document.hidden) {
        refetchNotifications();
        refetchUnreadCount();
      }
    }, 20000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [refetchNotifications, refetchUnreadCount]);

  // Stop all polling
  const stopAllPolling = useCallback(() => {
    
    if (rapidPollingIntervalRef.current) {
      clearInterval(rapidPollingIntervalRef.current);
      rapidPollingIntervalRef.current = null;
    }
    
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
    
    const cleanupRapid = startRapidPolling();
    const cleanupNormal = startNormalPolling();

    // Cleanup polling on unmount
    return () => {
      cleanupRapid();
      cleanupNormal();
    };
  }, [startRapidPolling, startNormalPolling]);

  // Smart polling - pause when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllPolling();
      } else {
        // Refresh immediately when tab becomes visible
        refetchNotifications();
        refetchUnreadCount();
        startRapidPolling();
        startNormalPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetchNotifications, refetchUnreadCount, startRapidPolling, startNormalPolling, stopAllPolling]);

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
    startPolling: startRapidPolling,
    stopPolling: stopAllPolling,
  };
};