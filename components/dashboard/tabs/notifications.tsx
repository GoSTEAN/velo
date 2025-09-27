"use client";

import { Bell, Check } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
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
  // Include backend fields for compatibility
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
    // Include backend fields
    type: backendNotif.type,
    message: backendNotif.message,
    details: backendNotif.details,
    isRead: backendNotif.isRead,
    createdAt: backendNotif.createdAt
  };
};

export default function Notifications() {
  const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, token } = useAuth();
  const [activeTab, setActiveTab] = useState<"today" | "this-week" | "earlier">("today");
  const [notifications, setNotifications] = useState<FrontendNotification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [displayedPages, setDisplayedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
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
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.page);
      
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

  // Filter notifications by active tab
  const filteredNotifications = notifications.filter(
    (notif) => notif.category === activeTab
  );

  // Update displayed pages for pagination
  useEffect(() => {
    const total = Math.ceil(filteredNotifications.length / itemsPerPage);
    setTotalPages(total);
    updateDisplayedPages(currentPage, total);
  }, [currentPage, activeTab, filteredNotifications.length, itemsPerPage]);

  const updateDisplayedPages = (page: number, total: number) => {
    if (total <= 1) {
      setDisplayedPages([]);
      return;
    }

    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > total) {
      endPage = total;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    setDisplayedPages(pages);
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);

  const handleClearAll = () => {
    setNotifications([]);
    setCurrentPage(1);
    localStorage.removeItem("notifications");
  };

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

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleTabChange = (tab: "today" | "this-week" | "earlier") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    if (totalPages <= 1) return null;

    return (
      <>
        {displayedPages[0] > 1 && (
          <>
            <button
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground hover:bg-hover ${
                currentPage === 1 ? "font-bold" : ""
              }`}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            {displayedPages[0] > 2 && (
              <span className="text-muted-foreground">...</span>
            )}
          </>
        )}

        {displayedPages.map((number) => (
          <button
            key={number}
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? "bg-blue-600 text-white"
                : "bg-background border border-border text-foreground hover:bg-hover"
            }`}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}

        {displayedPages[displayedPages.length - 1] < totalPages && (
          <>
            {displayedPages[displayedPages.length - 1] < totalPages - 1 && (
              <span className="text-muted-foreground">...</span>
            )}
            <button
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground hover:bg-hover ${
                currentPage === totalPages ? "font-bold" : ""
              }`}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] pl-5 relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading notifications...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] pl-5 relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] pl-5 relative">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-foreground text-custom-lg">Notifications</h1>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="bg-Card p-2 text-foreground rounded-[7px] text-custom-xs"
            disabled={notifications.every(n => n.read)}
          >
            Mark all as read
          </button>
          <button
            onClick={handleClearAll}
            className="bg-Card p-2 text-foreground rounded-[7px] text-custom-xs"
            disabled={notifications.length === 0}
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {(["today", "this-week", "earlier"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-custom-sm font-medium capitalize ${
              activeTab === tab
                ? "text-muted-foreground border-b-2 border-button"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="flex flex-col">
        {currentItems.length > 0 ? (
          currentItems.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 flex gap-3 border-b border-border rounded-none items-start ${
                !notif.read ? "bg-blue-50 border-blue-200" : "bg-Card"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 mt-2 ${
                  !notif.read ? "bg-button" : "bg-foreground"
                }`}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-muted-foreground text-custom-md font-medium">
                    {notif.title}
                  </h3>
                  <span className="text-muted-foreground text-custom-xs">
                    {notif.time}
                  </span>
                </div>
                <p className="text-muted-foreground text-custom-sm mt-1">
                  {notif.description}
                </p>
                {notif.details && (
                  <div className="mt-2 text-custom-xs text-muted-foreground">
                    {Object.entries(notif.details).map(([key, value]) => (
                      <div key={key}>{`${key}: ${value}`}</div>
                    ))}
                  </div>
                )}
              </div>
              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="text-button text-custom-xs p-1 hover:bg-button hover:text-white rounded"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-8 flex flex-col items-center justify-center text-muted-foreground">
            <Bell size={48} className="mb-4 opacity-50" />
            <p className="text-custom-md">No notifications</p>
            <p className="text-custom-sm mt-1">You&apos;re all caught up!</p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredNotifications.length > 0 && (
        <div className="w-full flex justify-between items-center mt-6">
          <div className="text-muted-foreground text-custom-sm">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredNotifications.length)} of{" "}
            {filteredNotifications.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-hover"
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt; Prev
            </button>

            {renderPageNumbers()}

            <button
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-hover"
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}