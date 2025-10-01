
import { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/components/context/AuthContext'; 

interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  details?: {
    loginTime?: string;
    ip?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

interface FrontendNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "today" | "this-week" | "earlier";
  read: boolean;
  timestamp: Date;
  type?: string;
  message?: string;
  details?: any;
  isRead?: boolean;
  createdAt?: string;
}

// Type guard to check if a string is a valid category
const isValidCategory = (category: string): category is "today" | "this-week" | "earlier" => {
  return ["today", "this-week", "earlier"].includes(category);
};

// Helper function to categorize notifications based on timestamp
const categorizeNotification = (createdAt: string): "today" | "this-week" | "earlier" => {
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const timeDiff = now.getTime() - notificationDate.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (hoursDiff < 24) return "today";
  if (hoursDiff < 168) return "this-week"; // 7 days
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
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return notificationDate.toLocaleDateString();
};

// Transform backend notification to frontend format
const transformBackendNotification = (backendNotif: BackendNotification): FrontendNotification => {
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
    createdAt: backendNotif.createdAt
  };
};

export const useNotifications = () => {
  const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, token } = useAuth();
  const [notifications, setNotifications] = useState<FrontendNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async (page: number = 1, limit: number = 50, unreadOnly: boolean = false) => {
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
      const transformedNotifications = response.notifications.map(transformBackendNotification);
      
      setNotifications(transformedNotifications);
      
      // Update pagination based on backend response
      // Note: This is overridden later in component for client-side filtering, but kept for consistency
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      // Fallback to localStorage if backend fails
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, [getNotifications, token]);

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
            category: isValidCategory(n.category) ? n.category : "earlier"
          }))
          .filter((n: FrontendNotification) => n.timestamp <= new Date());
        
        setNotifications(validNotifications);
      } catch (error) {
        console.error('Error parsing notifications from localStorage:', error);
      }
    }
  }, []);

  // Initialize notifications
  useEffect(() => {
    fetchNotifications(1, 50);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      
      // Update local state optimistically
      setNotifications(notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true, isRead: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Fallback to local state update
      setNotifications(notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true, isRead: true } : notif
      ));
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state optimistically
      setNotifications(notifications.map((notif) => ({ 
        ...notif, 
        read: true, 
        isRead: true 
      })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Fallback to local state update
      setNotifications(notifications.map((notif) => ({ 
        ...notif, 
        read: true, 
        isRead: true 
      })));
    }
  };

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadFromLocalStorage,
  };
};