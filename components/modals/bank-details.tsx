// components/modals/bank-details.tsx

import * as React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/lib/utils";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface Bank {
  id: number;
  name: string;
  code: string;
  slug: string;
}

interface VerificationResult {
  account_number: string;
  account_name: string;
  bank_id: number;
  bank_name: string;
}

interface BankVerificationProps {
  show: boolean;
  selectedBank: Bank | null;
  setSelectedBank: React.Dispatch<React.SetStateAction<Bank | null>>;
  onClose: () => void;
  onBankVerified: (result: VerificationResult) => void;
}

export default function BankVerification({
  show,
  selectedBank,
  setSelectedBank,
  onClose,
  onBankVerified,
}: BankVerificationProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Fetch banks from Paystack API
  const fetchBanks = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://api.paystack.co/bank", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch banks");
      }

      const data = await response.json();

      if (data.status) {
        // Sort banks alphabetically
        const sortedBanks = data.data.sort((a: Bank, b: Bank) =>
          a.name.localeCompare(b.name)
        );
        setBanks(sortedBanks);
        setFilteredBanks(sortedBanks);
      } else {
        throw new Error(data.message || "Unable to load banks");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter banks based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = banks.filter(
        (bank) =>
          bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bank.code.includes(searchQuery)
      );
      setFilteredBanks(filtered);
    } else {
      setFilteredBanks(banks);
    }
  }, [searchQuery, banks]);

  // Verify account number
  const verifyAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;

    setIsVerifying(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/verify-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNumber: accountNumber.replace(/\s/g, ""),
          bankCode: selectedBank.code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // Don't call onBankVerified here - let the user click "Add Bank" button
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during verification"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Format account number with spaces for readability
  const formatAccountNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  // Select a bank
  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  // Handle account number change with auto-verification
  const handleAccountNumberChange = (value: string) => {
    const cleanedValue = value.replace(/\s/g, "");
    setAccountNumber(cleanedValue);

    // Auto-verify when account number reaches 10 digits
    if (cleanedValue.length === 10 && selectedBank) {
      verifyAccount();
    }
  };

  // Add verified bank account
 const handleAddBank = () => {
  if (result && selectedBank) {
    onBankVerified({
      account_number: result.account_number,
      account_name: result.account_name,
      bank_id: selectedBank.id,
      bank_name: selectedBank.name // Add bank name
    });
  }
};

  // Reset form when modal is closed
  useEffect(() => {
    if (!show) {
      setAccountNumber("");
      setResult(null);
      setError("");
      setSearchQuery("");
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      fetchBanks();
    }
  }, [show]);

  // Check if account number has exactly 10 digits
  const hasValidAccountNumber = accountNumber.length === 10;

  // Check if verify button should be enabled
  const isVerifyButtonEnabled =
    selectedBank && hasValidAccountNumber && !isVerifying && !result;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="w-full h-full absolute top-0 backdrop-blur-md"/>
      <div className="flex flex-col gap-[24px] bg-background rounded-md border-border border relative z-10 p-6 max-w-lg w-full mx-4">
        <button
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X />
        </button>
        <h1 className="text-foreground text-custom-lg font-bold">
          Bank Account Verification
        </h1>
        <p className="text-muted-foreground text-custom-sm">
          Verify bank account details using Paystack
        </p>

        <Card className="flex w-full bg-Card flex-col p-[24px] border-none">
          <div className="w-full flex flex-col gap-[24px]">
            {/* Bank Selection */}
            <div className="w-full flex flex-col gap-[10px]">
              <label
                htmlFor="bank"
                className="text-foreground text-custom-sm font-medium"
              >
                Select Bank
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={cn(
                    "w-full flex items-center justify-between p-[12px] text-left bg-background border border-border rounded-[12px] outline-none",
                    isDropdownOpen ? "border-[#2F80ED]" : ""
                  )}
                  disabled={isLoading}
                >
                  <span
                    className={
                      selectedBank ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {selectedBank ? selectedBank.name : "Select your bank"}
                  </span>
                  <ChevronDown
                    size={20}
                    className={cn(
                      "text-muted-foreground transition-transform",
                      isDropdownOpen ? "rotate-180" : ""
                    )}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute  bg-Card  z-10 w-full mt-1 bg-background border border-border rounded-[12px] shadow-lg max-h-60 overflow-auto">
                    {/* Search input */}
                    <div className="sticky top-0 bg-background p-2 border-b border-border">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Search banks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-background outline-none text-foreground"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Bank list */}
                    <div className="py-1">
                      {filteredBanks.length > 0 ? (
                        filteredBanks.map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => handleBankSelect(bank)}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-2 text-left hover:bg-nav",
                              selectedBank?.id === bank.id ? "bg-nav" : ""
                            )}
                          >
                            <span className="text-foreground">{bank.name}</span>
                            {selectedBank?.id === bank.id && (
                              <Check size={16} className="text-[#2F80ED]" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-muted-foreground">
                          No banks found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Number Input */}
            <div className="w-full flex flex-col gap-[10px]">
              <label
                htmlFor="accountNumber"
                className="text-foreground text-custom-sm font-medium"
              >
                Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                value={formatAccountNumber(accountNumber)}
                onChange={(e) => handleAccountNumberChange(e.target.value)}
                placeholder="e.g. 0123 4567 890"
                maxLength={14}
                className="w-full p-[12px] bg-background border border-border rounded-[12px] outline-none focus:border-[#2F80ED] text-foreground"
                disabled={!selectedBank || isLoading}
              />
              {accountNumber.length > 0 && accountNumber.length < 10 && (
                <p className="text-custom-xs text-muted-foreground">
                  Enter 10 digits to verify
                </p>
              )}
              {hasValidAccountNumber && (
                <p className="text-custom-xs text-green-600">
                  ✓ 10 digits entered - ready to verify
                </p>
              )}
            </div>

            {/* Manual Verify Button (shown when account has 10 digits but not verified yet) */}
            {hasValidAccountNumber && !result && (
              <button
                onClick={verifyAccount}
                disabled={!isVerifyButtonEnabled}
                className="w-full rounded-[12px] bg-button text-button font-bold hover:bg-hover duration-200 transition-colors p-[16px_32px] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Account"
                )}
              </button>
            )}

            {/* Add Bank Button (only shown after successful verification) */}
            {result && (
              <button
                onClick={handleAddBank}
                className="w-full rounded-[12px] bg-green-600 text-white font-bold hover:bg-green-700 duration-200 transition-colors p-[16px_32px] mt-4"
              >
                Add Bank Account
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-400 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Error: {error}</span>
                </div>
              </div>
            )}

            {/* Verification Result */}
            {result && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 text-green-400 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Verification Successful</span>
                </div>
                <div className="mt-2">
                  <p>
                    <span className="font-semibold">Account Name:</span>{" "}
                    {result.account_name}
                  </p>
                  <p>
                    <span className="font-semibold">Account Number:</span>{" "}
                    {result.account_number}
                  </p>
                  <p>
                    <span className="font-semibold">Bank:</span>{" "}
                    {selectedBank?.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
