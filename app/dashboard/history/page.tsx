"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  Users,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useTransactions } from "@/components/hooks/useTransactions";

declare global {
  interface Date {
    toRelativeTime(): string;
  }
}

// Add toRelativeTime method to Date prototype
Date.prototype.toRelativeTime = function () {
  const now = new Date("2025-09-25T08:40:00+01:00");
  const diffMs = now.getTime() - this.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

interface Transaction {
  id: string;
  type: string;
  chain: string;
  amount: string;
  currency: string;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  status: string;
  timestamp: string;
}

const ActivityIcon = ({ type, status }: { type: string; status: string }) => {
  const baseClasses = "p-2 hidden sm:flex rounded-full";

  if (status === "pending") {
    return (
      <div className={`${baseClasses} bg-yellow-100 text-yellow-600`}>
        <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "failed") {
    return <div className={`${baseClasses} bg-red-100 text-red-600`}>⚠️</div>;
  }

  switch (type) {
    case "incoming":
      return (
        <div className={`${baseClasses} bg-green-100 text-green-600`}>
          <ArrowDownLeft size={16} />
        </div>
      );
    case "outgoing":
      return (
        <div className={`${baseClasses} bg-red-100 text-red-600`}>
          <ArrowUpRight size={16} />
        </div>
      );
    case "swap":
      return (
        <div className={`${baseClasses} bg-purple-100 text-purple-600`}>
          <ArrowUpDown size={16} />
        </div>
      );
    case "split":
      return (
        <div className={`${baseClasses} bg-blue-100 text-blue-600`}>
          <Users size={16} />
        </div>
      );
    default:
      return (
        <div className={`${baseClasses} bg-gray-100 text-gray-600`}>
          <DollarSign size={16} />
        </div>
      );
  }
};

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [displayedPages, setDisplayedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const { transactions, pagination, error, refetch } = useTransactions({
    page: currentPage,
    limit: itemsPerPage,
  });

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

  useEffect(() => {
    if (pagination) {
      setTotalPages(pagination.totalPages || 0);
      updateDisplayedPages(currentPage, pagination.totalPages || 0);
    }
  }, [pagination, currentPage]);

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground hover:bg-hover ${currentPage === 1 ? "font-bold" : ""
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
            className={`px-3 py-1 rounded-md ${currentPage === number
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
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground hover:bg-hover ${currentPage === totalPages ? "font-bold" : ""
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

  if (transactions.length === 0) {
    // Render a nicer skeleton while initial transactions load (or no cached data)
    return (
      <div className="w-full p-[32px_20px_172px_32px]">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 lg:p-4 rounded-lg bg-muted/20"
            >
              <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse hidden sm:block" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/5 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-2/5 h-3 bg-gray-200 rounded animate-pulse mt-2" />
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-auto p-[32px_20px_172px_32px] transition-all duration-300">
      <div className="w-full flex flex-col">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg lg:text-xl font-semibold">
              Transactions History
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs lg:text-sm"
            >
              View all
              <ChevronRight className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 lg:space-y-4">
            {error && (
              <div className="error-banner">
                Error: {error}
                <button onClick={() => refetch()} className="retry-btn">
                  Retry
                </button>
              </div>
            )}

            {transactions.length < 1 ? (
              <div className="w-full min-h-full ">
                <div className="text-center py-4 text-muted-foreground">
                  Loading...
                </div>
              </div>
            ) : filteredTransactions.length === 0 ? ( // UPDATE: Use filteredTransactions
              <div className="text-center py-4 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 lg:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                    <ActivityIcon type={tx.type} status={tx.status} />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-medium text-xs lg:text-sm truncate">
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}{" "}
                        {tx.type === "swap"
                          ? `(${tx.fromAddress} to ${tx.toAddress})`
                          : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toRelativeTime()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p
                        className={`font-semibold text-xs lg:text-sm ${tx.type === "incoming"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {tx.type === "incoming" ? "+" : "-"}
                        {tx.amount} {tx.currency}
                      </p>
                      <Badge
                        variant={
                          tx.status === "completed" || tx.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs capitalize"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="w-full flex justify-between items-center mt-6">
          <div className="text-muted-foreground text-custom-sm">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground ${currentPage === 1
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
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground ${currentPage === totalPages
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
      </div>
    </div>
  );
}
