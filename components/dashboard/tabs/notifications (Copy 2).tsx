"use client";

import { Bell, Check } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "today" | "this-week" | "earlier";
  read: boolean;
  timestamp: Date;
}

// Type guard to check if a value is a valid Notification
const isValidNotification = (obj: any): obj is Notification => {
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.time === 'string' &&
    (obj.category === 'today' || obj.category === 'this-week' || obj.category === 'earlier') &&
    typeof obj.read === 'boolean' &&
    obj.timestamp instanceof Date
  );
};

console.log(isValidNotification)

// Type guard to check if a string is a valid category
const isValidCategory = (category: string): category is "today" | "this-week" | "earlier" => {
  return ["today", "this-week", "earlier"].includes(category);
};

// Helper function to generate notifications with proper timestamps
const generateNotifications = (): Notification[] => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const notifications = [
    {
      id: "1",
      title: "Payment received",
      description:
        "You just received 2,500 USDT (~₦3,750,000). The funds have been added to your wallet balance.",
      time: "5 Minutes ago",
      category: "today" as const,
      read: false,
      timestamp: new Date(now.getTime() - 5 * 60 * 1000),
    },
    {
      id: "2",
      title: "New transaction",
      description:
        "A payment of 100 STRK has been successfully credited to your account. You can view the details on Starknet Explorer.",
      time: "40 Minutes ago",
      category: "today" as const,
      read: false,
      timestamp: new Date(now.getTime() - 40 * 60 * 1000),
    },
    {
      id: "3",
      title: "Revenue split complete",
      description:
        "Your incoming payment was automatically divided according to your preset rules. All recipients have received their share.",
      time: "59 Minutes ago",
      category: "today" as const,
      read: true,
      timestamp: new Date(now.getTime() - 59 * 60 * 1000),
    },
    {
      id: "4",
      title: "You received a split",
      description:
        "Your 40% share equals 39.8 USDC (~₦59,700), transferred directly into your wallet.",
      time: "1h ago",
      category: "this-week" as const,
      read: true,
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
    {
      id: "5",
      title: "Withdrawal requested",
      description:
        "You've requested to withdraw 100 USDC (~₦150,000). The request has been logged and will be processed shortly.",
      time: "2h ago",
      category: "this-week" as const,
      read: true,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: "6",
      title: "Wallet connected",
      description:
        "Your wallet (0x123...) is now successfully connected to the platform. You can begin making and receiving payments.",
      time: "6h ago",
      category: "earlier" as const,
      read: true,
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    // Add more notifications to test pagination
    ...Array.from({ length: 15 }, (_, i) => {
      const hoursAgo = i + 7;
      const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      const category = hoursAgo < 24 ? "this-week" as const : "earlier" as const;

      return {
        id: `extra-${i + 7}`,
        title: `Notification ${i + 7}`,
        description: `This is an additional notification for testing pagination.`,
        time: `${hoursAgo}h ago`,
        category,
        read: true,
        timestamp,
      };
    }),
  ].filter((notif) => notif.timestamp >= oneWeekAgo);

  return notifications;
};

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<"today" | "this-week" | "earlier">(
    "today"
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [displayedPages, setDisplayedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch notifications with useCallback to avoid useEffect dependency issues
  const fetchNotifications = useCallback(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const savedNotifications = localStorage.getItem("notifications");
    let initialNotifications: Notification[];

    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Validate and transform each notification
        initialNotifications = parsed
          .map((n: any) => {
            const timestamp = new Date(n.timestamp);
            const category = isValidCategory(n.category) ? n.category : "earlier";
            
            return {
              id: String(n.id),
              title: String(n.title),
              description: String(n.description),
              time: String(n.time),
              category,
              read: Boolean(n.read),
              timestamp
            };
          })
          .filter((n: Notification) => n.timestamp >= oneWeekAgo);
      } catch (error) {
        console.error('Error parsing notifications from localStorage:', error);
        initialNotifications = generateNotifications();
      }
    } else {
      initialNotifications = generateNotifications();
    }

    setNotifications(initialNotifications);
  }, []);

  // Initialize notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Filter notifications by active tab and calculate pagination
  const filteredNotifications = notifications.filter(
    (notif) => notif.category === activeTab
  );

  useEffect(() => {
    // Calculate total pages
    const total = Math.ceil(filteredNotifications.length / itemsPerPage);
    setTotalPages(total);

    // Update displayed pages
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
  const currentItems = filteredNotifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleClearAll = () => {
    setNotifications([]);
    setCurrentPage(1);
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
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

  return (
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] pl-5 relative">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-foreground text-custom-lg">Notifications</h1>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="bg-Card p-2 text-foreground rounded-[7px] text-custom-xs"
          >
            Mark all as read
          </button>
          <button
            onClick={handleClearAll}
            className="bg-Card p-2 text-foreground rounded-[7px] text-custom-xs"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => {
            setActiveTab("today");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-custom-sm font-medium ${
            activeTab === "today"
              ? "text-muted-foreground border-b-2 border-button"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => {
            setActiveTab("this-week");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-custom-sm font-medium ${
            activeTab === "this-week"
              ? " border-b-2 border-button text-muted-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => {
            setActiveTab("earlier");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-custom-sm font-medium ${
            activeTab === "earlier"
              ? "text-muted-foreground border-b-2 border-button"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Earlier
        </button>
      </div>

      {/* Notification List */}
      <div className="flex flex-col ">
        {currentItems.length > 0 ? (
          currentItems.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 flex gap-3 border-b border-border rounded-none  items-start ${
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