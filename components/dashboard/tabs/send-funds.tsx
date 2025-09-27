// components/send-funds.tsx
"use client";

import { Card } from "@/components/ui/Card";
import {
  ChevronDown,
  Send,
  Loader2,
  ExternalLink,
  CheckCheck,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import { useAuth } from "@/components/context/AuthContext";
import {  shortenAddress } from "@/components/lib/utils";
import useExchangeRates from "@/components/hooks/useExchangeRate";

interface SendTransactionData {
  toAddress: string;
  amount: string;
  token: string;
  chain: string;
  fee?: string;
}

export default function SendFunds() {
  const [selectedToken, setSelectedToken] = useState("STRK");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [amountInNGN, setAmountInNGN] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const { addresses, loading: addressesLoading } = useWalletAddresses();
  const { getWalletBalances, token: authToken } = useAuth();
  const { rates, } = useExchangeRates();

  console.log(addresses);
  // Token balances state
  const [balances, setBalances] = useState<{ [key: string]: number }>({});

  // Check if wallet addresses are available before rendering
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setLoading(false);
    } else if (!addressesLoading) {
      setLoading(false);
    }
  }, [addresses, addressesLoading]);

  // Fetch wallet balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!authToken) return;

      try {
        const walletBalances = await getWalletBalances();
        const balanceMap: { [key: string]: number } = {};

        walletBalances.forEach((balance) => {
          const tokenSymbol = balance.symbol.toUpperCase();
          balanceMap[tokenSymbol] = parseFloat(balance.balance) || 0;
        });

        setBalances(balanceMap);
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [authToken, getWalletBalances]);

  const tokenOptions = [
    {
      symbol: "STRK",
      name: "Starknet",
      icon: "/starknet.svg",
      chain: "starknet",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      icon: "/ethereum.svg",
      chain: "ethereum",
    },
    {
      symbol: "USDT",
      name: "Tether",
      icon: "/usdtlogo.svg",
      chain: "starknet",
    },
    { symbol: "USDC", name: "USD Coin", icon: "🔵", chain: "starknet" },
    { symbol: "SOL", name: "Solana", icon: "/solana.svg", chain: "solana" },
    { symbol: "BTC", name: "Bitcoin", icon: "/bitcoin.svg", chain: "bitcoin" },
  ];

  const selectedTokenData = tokenOptions.find(
    (token) => token.symbol === selectedToken
  );

  // Calculate NGN equivalent
  useEffect(() => {
    if (amount && rates[selectedToken as keyof typeof rates] !== null) {
      const tokenRate = rates[selectedToken as keyof typeof rates];
      if (tokenRate !== null && tokenRate > 0) {
        const ngnValue = (parseFloat(amount) * tokenRate).toFixed(2);
        setAmountInNGN(ngnValue);
      } else {
        setAmountInNGN("");
        setErrorMessage("Invalid exchange rate for selected token");
      }
    } else {
      setAmountInNGN("");
    }
  }, [amount, selectedToken, rates]);
  // Handle amount input change
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*\.?\d*$/.test(value)) {
        setAmount(value);
      }
    },
    []
  );

  // Handle NGN amount input change
  const handleNGNAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*\.?\d*$/.test(value)) {
        setAmountInNGN(value);
        const tokenRate = rates[selectedToken as keyof typeof rates];
        if (tokenRate !== null && tokenRate > 0) {
          const tokenAmount = (parseFloat(value) / tokenRate).toFixed(6);
          setAmount(tokenAmount);
        } else {
          setAmount("");
        }
      }
    },
    [selectedToken, rates]
  );
  // Get current balance for selected token
  const currentBalance = balances[selectedToken] || 0;

  // Estimate transaction fee (mock data - in a real app, this would come from the blockchain)
  const estimatedFee = "0.001";

  // Handle token selection
  const handleTokenSelect = useCallback((tokenSymbol: string) => {
    setSelectedToken(tokenSymbol);
    setShowTokenDropdown(false);
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    if (!recipientAddress.trim()) {
      setErrorMessage("Please enter recipient address");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount");
      return false;
    }

    if (parseFloat(amount) > currentBalance) {
      setErrorMessage("Insufficient balance");
      return false;
    }

    // Basic address validation
    if (
      selectedTokenData?.chain === "starknet" &&
      !recipientAddress.startsWith("0x")
    ) {
      setErrorMessage("Invalid Starknet address");
      return false;
    }

    if (
      selectedTokenData?.chain === "ethereum" &&
      !recipientAddress.startsWith("0x")
    ) {
      setErrorMessage("Invalid Ethereum address");
      return false;
    }

    setErrorMessage("");
    return true;
  }, [recipientAddress, amount, currentBalance, selectedTokenData]);

  // Handle send transaction
  const handleSend = useCallback(async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setTransactionStatus("pending");

    try {
      // Simulate API call to send transaction
      // In a real implementation, this would call your backend API
      const transactionData: SendTransactionData = {
        toAddress: recipientAddress,
        amount: amount,
        token: selectedToken,
        chain: selectedTokenData?.chain || "starknet",
        fee: estimatedFee,
      };

      console.log(transactionData)
      // Mock API call delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate successful transaction
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
      setTxHash(mockTxHash);
      setTransactionStatus("success");

      // Reset form after success
      setTimeout(() => {
        setRecipientAddress("");
        setAmount("");
        setAmountInNGN("");
        setTransactionStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrorMessage("Transaction failed. Please try again.");
      setTransactionStatus("error");
    } finally {
      setIsProcessing(false);
    }
  }, [
    validateForm,
    recipientAddress,
    amount,
    selectedToken,
    selectedTokenData,
    estimatedFee,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showTokenDropdown) {
        setShowTokenDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showTokenDropdown]);

  // Show loading state
  if (loading || addressesLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] flex flex-col items-center pl-5">
      <Card className="w-full max-w-md bg-Card mt-10 p-8 flex flex-col gap-6 rounded-xl">
        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-foreground text-xl font-bold">Send Funds</h1>
          <p className="text-muted-foreground text-sm">
            Transfer tokens to any external wallet address
          </p>
        </div>

        {/* Token Selection */}
        <div className="w-full flex flex-col gap-3 relative">
          <label className="text-foreground text-sm font-medium">
            Select Token
          </label>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowTokenDropdown(!showTokenDropdown);
            }}
            className="w-full flex p-3 items-center justify-between rounded-lg bg-background border border-border cursor-pointer hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                {selectedTokenData?.icon.startsWith("/") ? (
                  <Image
                    src={selectedTokenData.icon}
                    alt={selectedToken}
                    width={16}
                    height={16}
                  />
                ) : (
                  <span className="text-xs font-bold">
                    {selectedTokenData?.icon}
                  </span>
                )}
              </div>
              <span className="text-foreground font-medium">
                {selectedToken}
              </span>
              <span className="text-muted-foreground text-sm">
                Balance: {currentBalance.toFixed(4)}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-muted-foreground transition-transform ${
                showTokenDropdown ? "rotate-180" : ""
              }`}
            />
          </div>

          {showTokenDropdown && (
            <div className="w-full h-full relative">
              <div className="w-full h-full absolute top-0 backdrop-blur-md " />

              <Card className="w-full relative top-full flex flex-col text-muted-foreground left-0 z-10 mt-1 shadow-lg border border-border">
                {tokenOptions.map((token, id) => (
                  <button
                    key={id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTokenSelect(token.symbol);
                    }}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-hover hover:text-white transition-colors ${
                      selectedToken === token.symbol ? "bg-accent" : ""
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      {token.icon.startsWith("/") ? (
                        <Image
                          src={token.icon}
                          alt={token.symbol}
                          width={16}
                          height={16}
                        />
                      ) : (
                        <span className="text-xs font-bold">{token.icon}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-xs">
                        Balance: {(balances[token.symbol] || 0).toFixed(4)}
                      </span>
                    </div>
                  </button>
                ))}
              </Card>
            </div>
          )}
        </div>

        {/* Recipient Address */}
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="recipient"
            className="text-foreground text-sm font-medium"
          >
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder={`Enter ${selectedToken} address`}
            className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
          />
        </div>

        {/* Amount Input */}
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="amount"
            className="text-foreground text-sm font-medium"
          >
            Amount
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.0"
                className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {selectedToken}
              </p>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={amountInNGN}
                onChange={handleNGNAmountChange}
                placeholder="0.0"
                className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
              />
              <p className="text-xs text-muted-foreground mt-1">NGN</p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="w-full flex flex-col gap-2 p-4 bg-accent/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Network Fee:</span>
            <span className="text-foreground text-sm">
              {estimatedFee} {selectedToken}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">
              Total to Send:
            </span>
            <span className="text-foreground text-sm font-medium">
              {(parseFloat(amount || "0") + parseFloat(estimatedFee)).toFixed(
                6
              )}{" "}
              {selectedToken}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="w-full p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Transaction Status */}
        {transactionStatus === "pending" && (
          <div className="w-full p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Processing transaction...
            </p>
          </div>
        )}

        {transactionStatus === "success" && (
          <div className="w-full p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCheck size={16} className="text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-300">
                Transaction Successful!
              </span>
            </div>
            <p className="text-green-700 dark:text-green-400 text-sm mb-2">
              {amount} {selectedToken} sent to{" "}
              {shortenAddress(recipientAddress as `0x${string}`, 6)}
            </p>
            <a
              href={`https://explorer.starknet.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
            >
              View on Explorer <ExternalLink size={12} />
            </a>
          </div>
        )}

        {transactionStatus === "error" && (
          <div className="w-full p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <TriangleAlert size={16} className="text-red-600" />
            <p className="text-red-700 dark:text-red-300 text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={
            isProcessing ||
            !recipientAddress ||
            !amount ||
            parseFloat(amount) <= 0
          }
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={16} />
              Send {selectedToken}
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300 text-xs">
            💡 Always double-check the recipient address. Transactions cannot be
            reversed.
          </p>
        </div>
      </Card>
    </div>
  );
}
