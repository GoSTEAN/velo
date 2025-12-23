"use client";

import { Card } from "@/components/ui/Card";
import {
  Search,
  MessageCircle,
  BookOpen,
  HelpCircle,
  Mail,
  Globe,
  FileText,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [displayedPages, setDisplayedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  // FAQ data
  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "How do I create a payment split?",
      answer:
        "To create a payment split, go to the 'Split' tab, click the '+' Button, add recipients with their percentages, and confirm the split creation.",
      category: "payments",
    },
    {
      id: "2",
      question: "What tokens are supported for swapping?",
      answer:
        "We currently support USDT, USDC, STRK, and ETH for swapping to Naira.",
      category: "swap",
    },
    {
      id: "3",
      question: "How do I generate a QR code for payments?",
      answer:
        "Navigate to the 'QRPayment' tab, enter the amount in Naira, select a token, and click 'Create Payment Request' to generate your QR code.",
      category: "payments",
    },
    {
      id: "4",
      question: "How long do transactions take to process?",
      answer:
        "Most transactions are processed within 2-5 minutes, but Starknet transactions can sometimes take up to 15 minutes during high network congestion.",
      category: "general",
    },
    {
      id: "5",
      question: "How do I connect my wallet?",
      answer:
        "Click the 'Connect Wallet' Button in the header and select your preferred wallet provider (ArgentX or Braavos).",
      category: "wallets",
    },
    {
      id: "6",
      question: "What are the transaction fees?",
      answer:
        "We charge a 0.5% fee on all transactions. Network (gas) fees are additional and vary based on blockchain congestion.",
      category: "fees",
    },
    {
      id: "7",
      question: "How do I export my transaction history?",
      answer:
        "Go to the 'History' tab and click the 'Export CSV' Button to download your transaction history.",
      category: "history",
    },
    {
      id: "8",
      question: "Can I use testnet and mainnet?",
      answer:
        "Yes, your wallet addresses work on both testnet and mainnet. Switching networks only changes which blockchain you're viewing.",
      category: "wallets",
    },
    {
      id: "9",
      question: "How do I update my profile information?",
      answer:
        "Navigate to the 'Profile' tab to edit your personal information and linked bank accounts.",
      category: "profile",
    },
    {
      id: "10",
      question: "What should I do if a transaction fails?",
      answer:
        "Failed transactions typically refund automatically. If you don't receive a refund within 24 hours, please contact our support team.",
      category: "troubleshooting",
    },
    {
      id: "11",
      question: "How secure is my data?",
      answer:
        "We use industry-standard encryption and security practices. Your private keys never leave your device, and we don't have access to your funds.",
      category: "security",
    },
    {
      id: "12",
      question: "Can I use multiple bank accounts?",
      answer:
        "Yes, you can link multiple bank accounts in your profile settings and select which one to use for transactions.",
      category: "banking",
    },
  ];

  // Help articles
  const articles: Article[] = [
    {
      id: "1",
      title: "Getting Started Guide",
      description:
        "A comprehensive guide to setting up your account and making your first transaction.",
      category: "guides",
      readTime: "5 min read",
    },
    {
      id: "2",
      title: "Understanding Transaction Fees",
      description:
        "Learn about our fee structure and how to minimize transaction costs.",
      category: "fees",
      readTime: "3 min read",
    },
    {
      id: "3",
      title: "Troubleshooting Common Issues",
      description: "Solutions for the most frequently encountered problems.",
      category: "troubleshooting",
      readTime: "7 min read",
    },
    {
      id: "4",
      title: "Security Best Practices",
      description: "How to keep your account and funds secure.",
      category: "security",
      readTime: "4 min read",
    },
    {
      id: "5",
      title: "Advanced Split Configurations",
      description: "How to set up complex payment distribution scenarios.",
      category: "payments",
      readTime: "6 min read",
    },
  ];

  // Contact options
  const contactOptions: ContactOption[] = [
    {
      id: "1",
      title: "Live Chat",
      description: "Get immediate assistance from our support team",
      icon: <MessageCircle size={20} />,
      action: "Start Chat",
    },
    {
      id: "2",
      title: "Email Support",
      description:
        "Send us a detailed message and we'll respond within 24 hours",
      icon: <Mail size={20} />,
      action: "Send Email",
    },
    {
      id: "3",
      title: "Knowledge Base",
      description: "Browse our comprehensive documentation and guides",
      icon: <BookOpen size={20} />,
      action: "Browse Articles",
    },
  ];

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Topics" },
    { id: "payments", name: "Payments" },
    { id: "wallets", name: "Wallets" },
    { id: "swap", name: "Swap" },
    { id: "fees", name: "Fees" },
    { id: "security", name: "Security" },
    { id: "troubleshooting", name: "Troubleshooting" },
  ];

  // Filter FAQs based on search query and active category
  const filteredFaqs = faqs.filter(
    (faq) =>
      (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (activeCategory === "all" || faq.category === activeCategory)
  );

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFaqs.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    // Calculate total pages
    const total = Math.ceil(filteredFaqs.length / itemsPerPage);
    setTotalPages(total);

    // Update displayed pages
    updateDisplayedPages(currentPage, total);
  }, [currentPage, searchQuery, activeCategory, filteredFaqs.length]);

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
            <Button
              size="sm"
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground hover:bg-hover ${
                currentPage === 1 ? "font-bold" : ""
              }`}
              onClick={() => handlePageChange(1)}
            >
              1
            </Button>
            {displayedPages[0] > 2 && (
              <span className="text-muted-foreground">...</span>
            )}
          </>
        )}

        {displayedPages.map((number) => (
          <Button
            size="sm"
            key={number}
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? "bg-blue-600 text-white"
                : "bg-background border border-border text-foreground hover:bg-hover"
            }`}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </Button>
        ))}

        {displayedPages[displayedPages.length - 1] < totalPages && (
          <>
            {displayedPages[displayedPages.length - 1] < totalPages - 1 && (
              <span className="text-muted-foreground">...</span>
            )}
            <Button
              size="sm"
              className={`px-3 py-1 bg-background border border-border rounded-md text-foreground hover:bg-hover ${
                currentPage === totalPages ? "font-bold" : ""
              }`}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
      </>
    );
  };

  //   Live chat would typically open a chat widget; here we just alert for demo
  const handleContactAction = (actionType: string) => {
    switch (actionType) {
      case "Start Chat":
        alert("Live chat would open here");
        break;
      case "Send Email":
        window.location.href = "mailto:support@yourplatform.com";
        break;
      case "Browse Articles":
        // Scroll to articles section
        document
          .getElementById("knowledge-base")
          ?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full h-auto p-[32px_20px_172px_32px] transition-all duration-300">
      <div className="w-full flex flex-col">
        <h1 className="text-foreground text-xl font-normal">Help Center</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Find answers to common questions and get support
        </p>

        {/* Search Section */}
        <div className="w-full mb-8">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or guides..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="w-full flex overflow-x-auto gap-2 mb-6 pb-2">
          {categories.map((category) => (
            <Button
              size="sm"
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-custom-sm whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-Button text-Button"
                  : "bg-background text-foreground border border-border"
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Contact Options */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {contactOptions.map((option) => (
            <Card
              key={option.id}
              className="p-4 flex flex-col items-center text-center hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-Button flex items-center justify-center text-Button mb-3">
                {option.icon}
              </div>
              <h3 className="text-foreground text-base font-normal mb-1">
                {option.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                {option.description}
              </p>
              <Button
                size="sm"
                onClick={() => handleContactAction(option.action)}
                className="w-full"
              >
                {option.action}
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="w-full mb-8">
          <h2 className="text-foreground text-lg font-medium mb-4">
            Frequently Asked Questions
          </h2>

          {currentItems.length > 0 ? (
            <div className="space-y-4">
              {currentItems.map((faq) => (
                <Card
                  key={faq.id}
                  className="p-4 border flex-col lg:flex-row border-border/30 w-full"
                >
                  <h3 className=" w-full text-foreground text-base font-normal mb-2 flex items-start">
                    <HelpCircle
                      className="text-head mr-2 mt-1 flex-shrink-0"
                      size={18}
                    />
                    {faq.question}
                  </h3>
                  <p className=" w-full text-muted-foreground text-sm pl-6">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 flex flex-col items-center justify-center text-muted-foreground">
              <HelpCircle size={48} className="mb-4 opacity-40" />
              <p className="text-base">No questions found</p>
              <p className="text-sm mt-1">
                Try a different search term or category
              </p>
            </Card>
          )}

          {/* Pagination for FAQs */}
          {filteredFaqs.length > 0 && (
            <div className="w-full flex flex-col gap-2 md:flex-row justify-between items-center mt-6">
              <div className="text-muted-foreground text-custom-sm">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredFaqs.length)} of{" "}
                {filteredFaqs.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className={`px-3 py-1 bg-background border border-border rounded-md text-foreground ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-hover"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt; Prev
                </Button>

                {renderPageNumbers()}

                <Button
                  size="sm"
                  className={`px-3 py-1 bg-background border border-border rounded-md text-foreground ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-hover"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next &gt;
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Base Section (temporarily removed)
        <div id="knowledge-base" className="w-full">
          <h2 className="text-foreground text-lg font-semibold mb-4">
            Knowledge Base
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="p-4 border flex-col lg:flex-row border-border/30 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start mb-3 w-full">
                  <FileText
                    className="text-head mr-2 mt-1 flex-shrink-0"
                    size={18}
                  />
                  <h3 className="text-foreground text-base font-semibold">
                    {article.title}
                  </h3>
                </div>
                <p className="text-muted-foreground w-full text-sm mb-3">
                  {article.description}
                </p>
                <div className="flex justify-between w-full items-center">
                  <span className="text-muted-foreground text-xs bg-background px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {article.readTime}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        */}

        {/* Additional Help Section */}
        <Card className="w-full mt-8 p-4 bg-card border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-4  w-full md:mb-0">
              {/* <h3 className="text-foreground text-base font-normal ">
                Still need help?
              </h3> */}
              <p className="text-muted-foreground text-sm mr-6">
                Still need help?
                Our support team is available 24/7 to assist you with any issues
                or questions.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="primary"
                className="flex items-center"
              >
                <Globe size={16} className="mr-2" />
                Visit Community
              </Button>
              <Button size="sm" className="flex items-center">
                <Mail size={16} className="mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
