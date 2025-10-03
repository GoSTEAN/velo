import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "./Card";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NotificationProps {
  onclick: React.Dispatch<React.SetStateAction<string>>;
}

export default function Notification({ onclick }: NotificationProps) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { getUnreadCount } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFetchNotification = useCallback(async () => {
    if (isLoading) return; // Prevent concurrent requests
    
    try {
      setIsLoading(true);
      const notificationCount = await getUnreadCount();
      setCount(notificationCount);
    } catch (err) {
      console.error("Failed to fetch notification", err);
      // Optional: Implement retry logic or show error state
    } finally {
      setIsLoading(false);
    }
  }, [getUnreadCount, isLoading]);

  useEffect(() => {
    // Initial fetch
    handleFetchNotification();

    // Set up polling interval
    intervalRef.current = setInterval(handleFetchNotification, 10000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [handleFetchNotification]);

  // Optional: Stop polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (!document.hidden && !intervalRef.current) {
        intervalRef.current = setInterval(handleFetchNotification, 10000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleFetchNotification]);

  return (
    <button 
        type="button" 
        onClick={() => onclick("Notification")}
        className="relative cursor-pointer z-99"
      >
        <Bell size={21} className="text-foreground" />
        
        {count > 0 && (
          <div className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-white bg-red-400 flex items-center justify-center text-xs rounded-full">
            {count > 99 ? '99+' : count}
          </div>
        )}
      </button>
  );
}