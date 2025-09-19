"use client";

import { Card } from "@/components/ui/Card";
import { Trash, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface Notification {
  name: string;
  description: string;
  date: string;
  status: string;
  img?: string;
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [displayedPages, setDisplayedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  // Hardcoded notifications for demonstration
  const notifications: Notification[] = [
    {
      name: "Progress Ada",
      description: "Payment processing initiated",
      date: "August 10, 2025",
      status: "Processing",
    },
    {
      name: "Babatunde Abdullahi",
      description: "Payment failed due to insufficient funds",
      date: "August 10, 2025",
      status: "Failed",
    },
    {
      name: "Zainab Ogunleye",
      description: "Payment completed successfully",
      date: "August 10, 2025",
      status: "Completed",
    },
    {
      name: "Oluwaseun Adeyemi",
      description: "Transaction verification failed",
      date: "August 10, 2025",
      status: "Failed",
    },
    {
      name: "Emeka Nwosu",
      description: "Payment is being processed",
      date: "August 10, 2025",
      status: "Processing",
    },
    {
      name: "Fatima Abdullahi",
      description: "Split payment failed",
      date: "August 10, 2025",
      status: "Failed",
    },
    {
      name: "Osaretin Igbinovia",
      description: "QR payment attempt failed",
      date: "August 10, 2025",
      status: "Failed",
    },
    {
      name: "Nneka Obi",
      description: "Swap completed",
      date: "August 10, 2025",
      status: "Completed",
    },
    // Add more items to test pagination
    ...Array.from({ length: 15 }, (_, i) => ({
      name: `Additional User ${i + 1}`,
      description: `Additional transaction ${i + 1}`,
      date: "August 10, 2025",
      status: i % 3 === 0 ? "Completed" : i % 3 === 1 ? "Processing" : "Failed",
    })),
  ];

  useEffect(() => {
    // Calculate total pages
    const total = Math.ceil(filteredNotifications.length / itemsPerPage);
    setTotalPages(total);
    
    // Update displayed pages
    updateDisplayedPages(currentPage, total);
  }, [currentPage, searchQuery]);

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "failed":
        return "text-[#EF4444]";
      case "processing":
        return "text-[#1E488E]";
      case "completed":
        return "text-[#22C55E]";
      default:
        return "text-muted-foreground";
    }
  };

  const filteredNotifications = notifications.filter(
    (notif) =>
      notif.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);

  const thead = ["Name", "Description", "Timestamp", "Status"];

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
            {displayedPages[0] > 2 && <span className="text-muted-foreground">...</span>}
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
    <div className="w-full h-auto p-[32px_20px_172px_32px] transition-all duration-300">
      <div className="w-full flex flex-col">
        <h1 className="text-foreground text-custom-xl ">
           Transactions History
        </h1>
        <p className="text-muted-foreground text-custom-md mb-4">
          All your payments are recorded here
        </p>

        <div className="w-full flex justify-end mb-4">
          <Button className=" transition">
            Export CSV
          </Button>
        </div>

        <div className="w-full flex items-center mb-4 gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, description, or..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 max-w-3/5 outline-none bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button variant="secondary" className="flex items-center transition">
            <Trash size={16} />
            Clear All
          </Button>
        </div>

        <Card className="w-full overflow-x-scroll border border-border rounded-[12px]">
          <table className="w-full">
            <thead className="w-full bg-card text-muted-foreground">
              <tr className="w-full p-[14px_24px] justify-between flex">
                {thead.map((td, id) => (
                  <th key={id} className="text-custom-xs w-full text-left px-6 py-4">
                    {td}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((notif, id) => (
                <tr
                  key={id}
                  className="w-full p-[14px_24px] items-center justify-between flex border-b-[1px] border-border hover:bg-background transition-colors"
                >
                  <td className="flex gap-[8px] items-center w-full px-6 py-4">
                    <div className="w-[24px] h-[24px] rounded-full flex items-center justify-center border border-border p-[1px] relative">
                      {notif.img ? (
                        <Image src={notif.img} alt="user profile image" fill className="rounded-full object-cover" />
                      ) : (
                        <User className="text-background" size={13} />
                      )}
                    </div>
                    <span className="text-foreground text-custom-xs max-w-fit font-[400] truncate text-start">
                      {notif.name}
                    </span>
                  </td>
                  <td className="text-custom-xs text-foreground w-full truncate text-start px-6 py-4">
                    {notif.description}
                  </td>
                  <td className="text-custom-xs text-foreground w-full truncate text-start px-6 py-4">
                    {notif.date}
                  </td>
                  <td
                    className={`${getStatusColor(
                      notif.status
                    )} text-custom-sm w-full truncate text-start px-6 py-4 font-medium`}
                  >
                    {notif.status}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No History found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <div className="w-full flex justify-between items-center mt-6">
          <div className="text-muted-foreground text-custom-sm">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredNotifications.length)} of {filteredNotifications.length} results
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-hover"
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt; Prev
            </button>
            
            {renderPageNumbers()}
            
            <button 
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-hover"
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}