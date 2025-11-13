"use client";

import { Card } from "@/components/ui/Card";
import {
  Loader2,
  ArrowUpRight,
  Check,
  TriangleAlert,
  Copy,
  CheckCheck,
  AlertCircle,
} from "lucide-react";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { shortenAddress } from "@/components/lib/utils";
import useExchangeRates from "@/components/hooks/useExchangeRate";
import { AddressDropdown } from "@/components/modals/addressDropDown";
import { useWalletData } from "@/components/hooks/useWalletData";
import { useTokenBalance } from "@/components/hooks";
import { TransactionPinDialog } from "@/components/ui/transaction-pin-dialog";


interface TokenOption {
  symbol: string;
  name: string;
  chain: string;
  network: string;
  address: string;
  hasWallet: boolean;
}

export default function SendFunds() {
  const [selectedToken, setSelectedToken] = useState("ethereum");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
    const [showPinDialog, setShowPinDialog] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    txHash?: string;
  }>({ type: null, message: "" });

  const { sendTransaction } = useAuth();
  const { rates } = useExchangeRates();
  const {
    addresses,
    balances,
    breakdown,
  } = useWalletData();
  const { getTokenSymbol, getTokenName } = useTokenBalance();

  // Token options based on available addresses
  const tokenOptions: TokenOption[] = useMemo(() => {
    if (!addresses) return [];

    return addresses.map((addr) => {
      const balanceInfo = balances.find((b) => b.chain === addr.chain);
      return {
        symbol: getTokenSymbol(addr.chain),
        name: getTokenName(addr.chain),
        chain: addr.chain,
        network: addr.network,
        address: addr.address,
        hasWallet: true,
        balance: parseFloat(balanceInfo?.balance || "0"), 
      };
    });
  }, [addresses, balances]); // ADD balances dependency
  // Get token symbol

  // Normalize and validate Starknet address
  const normalizeStarknetAddress = (address: string): string => {
    // Remove whitespace
    let normalized = address.trim();

    // Add 0x prefix if missing
    if (!normalized.startsWith("0x")) {
      normalized = "0x" + normalized;
    }

    // Remove 0x for validation and padding
    const hexPart = normalized.slice(2);

    // Validate hex characters only
    if (!/^[0-9a-fA-F]*$/.test(hexPart)) {
      throw new Error(
        "Address contains invalid characters. Only hexadecimal characters (0-9, a-f, A-F) are allowed."
      );
    }

    // Pad to 64 characters (without 0x)
    const paddedHex = hexPart.padStart(64, "0");

    // Check if address is too long after padding
    if (paddedHex.length > 64) {
      throw new Error(
        "Address is too long. Maximum length is 66 characters (including 0x prefix)."
      );
    }

    return "0x" + paddedHex;
  };

  const selectedTokenData = tokenOptions.find(
    (token) => token.chain === selectedToken
  );

  // Get current wallet balance for selected token
  const currentWalletBalance = useMemo(() => {
    const balanceInfo = balances.find((b) => b.chain === selectedToken);
    return parseFloat(balanceInfo?.balance || "0");
  }, [balances, selectedToken]);
  // Get current wallet address and network for selected token
  const currentWalletAddress = useMemo(() => {
    if (!addresses) return "";
    const addressInfo = addresses.find((addr) => addr.chain === selectedToken);
    return addressInfo?.address || "";
  }, [addresses, selectedToken]);

  const currentNetwork = useMemo(() => {
    if (!addresses) return "mainnet";
    const addressInfo = addresses.find((addr) => addr.chain === selectedToken);
    return addressInfo?.network || "mainnet";
  }, [addresses, selectedToken]);

  // Check if selected token has a wallet
  const hasWalletForSelectedToken = useMemo(() => {
    return !!currentWalletAddress;
  }, [currentWalletAddress]);

  // Calculate NGN equivalent
  const ngnEquivalent = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      return 0;

    const tokenSymbol = getTokenSymbol(selectedToken);
    const tokenRate = rates[tokenSymbol as keyof typeof rates] || 1;
    return parseFloat(amount) * tokenRate;
  }, [amount, selectedToken, rates]);

  // Validation
  const validationError = useMemo(() => {
    if (!hasWalletForSelectedToken) {
      return "No wallet found for this currency";
    }
    if (!toAddress.trim()) {
      return "Recipient address is required";
    }
    if (!amount || parseFloat(amount) <= 0) {
      return "Amount must be greater than 0";
    }
    if (parseFloat(amount) > currentWalletBalance) {
      return "Insufficient balance";
    }
    return null;
  }, [hasWalletForSelectedToken, toAddress, amount, currentWalletBalance]);

  // Reset form
  const resetForm = useCallback(() => {
    setToAddress("");
    setAmount("");
    setTxStatus({ type: null, message: "" });
  }, []);

  // Handle token selection
  const handleTokenSelect = useCallback(
    (chain: string) => {
      setSelectedToken(chain);
      setShowTokenDropdown(false);
      resetForm();
    },
    [resetForm]
  );

  // Copy address to clipboard
  const handleCopyAddress = useCallback(async () => {
    if (!currentWalletAddress) return;

    try {
      await navigator.clipboard.writeText(currentWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address: ", err);
    }
  }, [currentWalletAddress]);

  // Handle send transaction
 const handleSendWithPin = async (pin: string) => {
    if (validationError) {
      setTxStatus({
        type: "error",
        message: validationError,
      });
      setShowPinDialog(false);
      return;
    }

    setIsSending(true);
    setTxStatus({ type: null, message: "" });

    try {
      let normalizedToAddress = toAddress.trim();
      let normalizedFromAddress = currentWalletAddress.trim();

      // Special handling for Starknet addresses
      if (selectedToken === "starknet") {
        try {
          normalizedToAddress = normalizeStarknetAddress(toAddress);
          normalizedFromAddress =
            normalizeStarknetAddress(currentWalletAddress);
          console.log("Normalized Starknet address:", normalizedToAddress);
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? `Invalid Starknet address: ${error.message}`
              : "Invalid Starknet address format"
          );
        }
      }

     
      // Include PIN in the transaction payload
      const response = await sendTransaction({
        chain: selectedToken,
        network: currentNetwork,
        toAddress: normalizedToAddress,
        amount: amount,
        fromAddress: currentWalletAddress,
        transactionPin: pin,
      });

      setTxStatus({
        type: "success",
        message: "Transaction sent successfully!",
        txHash: response.txHash,
      });

      // Close PIN dialog
      setShowPinDialog(false);

      // Reset form after 10 seconds
      setTimeout(() => {
        resetForm();
      }, 10000);
    } catch (error: any) {
      console.error("Transaction error:", error);

      let errorMessage = "Failed to send transaction. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setTxStatus({
        type: "error",
        message: errorMessage,
      });
      
      // Close PIN dialog on error
      setShowPinDialog(false);
    } finally {
      setIsSending(false);
    }
  };

  // Modified handleSendTransaction to show PIN dialog
  const handleSendTransaction = () => {
    if (validationError) {
      setTxStatus({
        type: "error",
        message: validationError,
      });
      return;
    }

    // Show PIN dialog instead of immediately sending
    setShowPinDialog(true);
  };

  // Handle PIN dialog close
  const handlePinDialogClose = () => {
    setShowPinDialog(false);
  };

 
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

  // Format balance display
  const formatBalance = (balance: number): string => {
    if (balance === 0) return "0.00";
    if (balance < 0.001) return "<0.001";
    return balance.toFixed(4);
  };

  // Format NGN currency
  const formatNGN = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get block explorer URL
  const getExplorerUrl = (txHash: string): string => {
    const explorerUrls: {
      [key: string]: { testnet: string; mainnet: string };
    } = {
      ethereum: {
        testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
        mainnet: `https://etherscan.io/tx/${txHash}`,
      },
      usdt_erc20: {
        testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
        mainnet: `https://etherscan.io/tx/${txHash}`,
      },
      bitcoin: {
        testnet: `https://blockstream.info/testnet/tx/${txHash}`,
        mainnet: `https://blockstream.info/tx/${txHash}`,
      },
      solana: {
        testnet: `https://explorer.solana.com/tx/${txHash}?cluster=devnet`,
        mainnet: `https://explorer.solana.com/tx/${txHash}`,
      },
      starknet: {
        testnet: `https://sepolia.voyager.online/tx/${txHash}`,
        mainnet: `https://voyager.online/tx/${txHash}`,
      },
    };

    const explorer = explorerUrls[selectedToken];
    if (!explorer) return "#";

    return currentNetwork === "testnet" ? explorer.testnet : explorer.mainnet;

  };

  

  if (addresses.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center gap-4 max-w-md">
          <h2 className="text-xl font-bold text-foreground">
            No Wallets Available
          </h2>
          <p className="text-muted-foreground text-center">
            No Velo wallets found. Please create wallets first to send funds.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6 mt-12 md:mt-16">
      <div className="space-y-6">
  <Card className="border-border/20 bg-card/50 flex-col backdrop-blur-sm p-4">
        {/* Header */}
          <div className="w-full flex flex-col gap-3 text-center">
            <h1 className="text-foreground text-xl font-bold">Send Payment</h1>
            <p className="text-muted-foreground text-sm gap-4">
              Transfer funds from your Velo wallet to any valid address
            </p>
          </div>

        <div className="space-y-6 w-full mt-8">
          {/* Transaction Status */}
          {txStatus.type && (
            <div
              className={`w-full p-4 rounded-lg border ${
                txStatus.type === "success"
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2">
                {txStatus.type === "success" ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <TriangleAlert size={16} className="text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    txStatus.type === "success" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {txStatus.type === "success" ? "Success" : "Error"}
                </span>
              </div>
              <p className={`text-sm mt-1 ${txStatus.type === "success" ? "text-green-500" : "text-red-500"}`}>
                {txStatus.message}
              </p>
              {txStatus.txHash && (
                <a
                  href={getExplorerUrl(txStatus.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-2 flex items-center gap-1"
                >
                  View on Explorer
                  <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          )}

          {/* Wallet Status Warning */}
          {!hasWalletForSelectedToken && (
            <div className="w-full p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">No Wallet Found</span>
              </div>
              <p className="text-warning text-sm mt-1">
                No Velo wallet found for {getTokenName(selectedToken)}. You can
                only send from wallets created in Velo.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-4">
              <AddressDropdown
                selectedToken={selectedToken}
                onTokenSelect={handleTokenSelect}
                showBalance={true}
                showNetwork={false}
                showAddress={true}
                disabled={isSending}
              />

              {/* Selected Wallet Address */}
              {currentWalletAddress && (
                <div className="w-full flex flex-col gap-2 p-3 bg-accent/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">From Address:</span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy address"
                    >
                      {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-foreground break-all">{shortenAddress(currentWalletAddress, 8)}</p>
                  <p className="text-xs text-muted-foreground capitalize">Network: {currentNetwork}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Recipient Address */}
              <div className="w-full flex flex-col gap-3">
                <label htmlFor="toAddress" className="text-foreground text-sm font-medium">Recipient Address</label>
                <input
                  type="text"
                  id="toAddress"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder={`Enter ${selectedTokenData?.name || selectedToken} address`}
                  className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                  disabled={!hasWalletForSelectedToken || isSending}
                />
                {selectedToken === "starknet" && toAddress && (
                  <p className="text-xs text-muted-foreground">Tip: Address will be automatically formatted with 0x prefix and proper padding</p>
                )}
              </div>

              {/* Amount */}
              <div className="w-full flex flex-col gap-3">
                <label htmlFor="amount" className="text-foreground text-sm font-medium">Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    id="amount"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        setAmount(value);
                      }
                    }}
                    placeholder="0.00"
                    className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors pr-20 disabled:opacity-50"
                    disabled={!hasWalletForSelectedToken || isSending}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">{selectedTokenData?.symbol}</div>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Available: {formatBalance(currentWalletBalance)} {selectedTokenData?.symbol}</span>
                  {ngnEquivalent > 0 && <span>≈ {formatNGN(ngnEquivalent)}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <div>
            <button
              onClick={handleSendTransaction}
              className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!!validationError || isSending}
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <ArrowUpRight size={16} />
                  {validationError || "Send Payment"}
                </>
              )}
            </button>
          </div>

          {/* Network Info */}
          <div className="w-full p-3 bg-accent/30 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">Sending on <span className="font-medium capitalize">{currentNetwork}</span> network</p>
          </div>
        </div>

          {/* Instructions */}
        </Card>

  <Card className="border-border/20 bg-card/50 flex-col relative -z-10 backdrop-blur-sm p-4">
          <h3 className="text-foreground text-sm font-medium">Important Notes</h3>
          <ul className="text-muted-foreground text-xs list-disc list-inside space-y-1 mt-2">
            <li>Recipient does NOT need to be a Velo user</li>
            <li>Only send to valid addresses for the selected currency</li>
            <li>Transactions are irreversible once confirmed</li>
            <li>Double-check addresses before sending</li>
            {selectedToken === "starknet" && (
              <>
                <li className="text-warning">
                  Starknet wallets may need deployment (auto-handled)
                </li>
                <li className="text-blue-500">
                  Addresses will be auto-formatted with 0x prefix and padding
                </li>
              </>
            )}
          </ul>
        </Card>

      <TransactionPinDialog
        isOpen={showPinDialog}
        onClose={handlePinDialogClose}
        onPinComplete={handleSendWithPin}
        isLoading={isSending}
        title="Authorize Transaction"
        description="Enter your transaction PIN to confirm this transfer"
      />
      </div>
    </div>
  );
}
