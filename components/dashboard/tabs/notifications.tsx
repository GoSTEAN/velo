"use client";

import { Bell, Check } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react"; // Remove SetStateAction import
import { Card } from "@/components/ui/Card";
import { useNotifications } from "@/components/hooks/useNotifications"; // Fixed path
import ViewNotificationDetails from "@/components/modals/view-notification-details";
import { FrontendNotification } from "@/types";

export default function Notifications() {
  const { notifications, error, markAsRead, markAllAsRead } =
    useNotifications();
  const [activeTab, setActiveTab] = useState<"today" | "this-week" | "earlier">(
    "today"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showNotifDetails, setShowNotifDetails] = useState(false);
  const [content, setContent] = useState<FrontendNotification | undefined>();

  // Use useMemo for filtered notifications to prevent unnecessary recalculations
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => notif.category === activeTab);
  }, [notifications, activeTab]);

  // Use useMemo for pagination data
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNotifications.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

    return { totalPages, indexOfLastItem, indexOfFirstItem, currentItems };
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const { totalPages, indexOfLastItem, indexOfFirstItem, currentItems } =
    paginationData;

  // Calculate displayed pages
  const displayedPages = useMemo(() => {
    const total = totalPages;
    if (total <= 1) return [];

    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > total) {
      endPage = total;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handleShowNotif = (id: string) => {
    const selectedNotif = notifications.find((notif) => notif.id === id);
    setContent(selectedNotif);
    setShowNotifDetails(true);
  };

  const handleClearAll = () => {
    setCurrentPage(1);
    localStorage.removeItem("notifications");
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
            disabled={notifications.every((n) => n.read)}
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
      <div className="flex border-b border-border/50 mb-6">
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
      <div className="flex flex-col text-muted-foreground">
        {currentItems.length > 0 ? (
          currentItems.map((notif) => (
            <button
              key={notif.id}
              onClick={(e) => {
                handleShowNotif(notif.id);
                e.stopPropagation();
              }}
              className={`p-4 flex gap-3 border-b border-border/50  rounded-none items-start ${
                !notif.read ? "bg-card/40 border-border/90" : "bg-Card"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 mt-2  ${
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
            </button>
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
      {content && (
        <ViewNotificationDetails
          category={content.category}
          message={content.message}
          time={content.time}
          title={content.title}
          description={content.description}
          ip={content.details?.ip}
          loginTime={content.details?.loginTime}
          userAgent={content.details?.userAgent}
          id={content.id}
          read={content.read}
          timestamp={content.timestamp}
          show={setShowNotifDetails}
          toggle={showNotifDetails}
        />
      )}{" "}
    </div>
  );
}
