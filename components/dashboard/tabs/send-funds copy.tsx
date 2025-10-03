"use client";

import { Card } from "@/components/ui/Card";
import {
  ChevronDown,
  Loader2,
  ArrowUpRight,
  Check,
  TriangleAlert,
  Copy,
  CheckCheck,
  AlertCircle,
} from "lucide-react";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import { useAuth } from "@/components/context/AuthContext";
import { shortenAddress } from "@/components/lib/utils";
import { useTotalBalance } from "@/components/hooks/useTotalBalance";
import useExchangeRates from "@/components/hooks/useExchangeRate";

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
  const [txStatus, setTxStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    txHash?: string;
  }>({ type: null, message: "" });

  const { addresses, loading: addressesLoading } = useWalletAddresses();
  const { token, sendTransaction, createSendMoneyNotification } = useAuth();
  const { breakdown, loading: balanceLoading } = useTotalBalance();
  const { rates, isLoading: ratesLoading } = useExchangeRates();

  // Token options based on available addresses
  const tokenOptions: TokenOption[] = useMemo(() => {
    if (!addresses) return [];

    return addresses.map((addr) => ({
      symbol: getTokenSymbol(addr.chain),
      name: getTokenName(addr.chain),
      chain: addr.chain,
      network: addr.network,
      address: addr.address,
      hasWallet: true,
    }));
  }, [addresses]);

  // Get token symbol
  function getTokenSymbol(chain: string): string {
    const symbolMap: { [key: string]: string } = {
      ethereum: "ETH",
      bitcoin: "BTC",
      solana: "SOL",
      starknet: "STRK",
      usdt_erc20: "USDT",
      usdt_trc20: "USDT",
    };
    return symbolMap[chain] || chain.toUpperCase();
  }

  // Get token name
  function getTokenName(chain: string): string {
    const nameMap: { [key: string]: string } = {
      ethereum: "Ethereum",
      bitcoin: "Bitcoin",
      solana: "Solana",
      starknet: "Starknet",
      usdt_erc20: "USDT ERC20",
      usdt_trc20: "USDT TRC20",
    };
    return nameMap[chain] || chain.charAt(0).toUpperCase() + chain.slice(1);
  }

  const selectedTokenData = tokenOptions.find(
    (token) => token.chain === selectedToken
  );

  // Get current wallet balance for selected token
  const currentWalletBalance = useMemo(() => {
    if (!breakdown || breakdown.length === 0) return 0;
    const balanceInfo = breakdown.find((b) => b.chain === selectedToken);
    return balanceInfo?.balance || 0;
  }, [breakdown, selectedToken]);

  // Get current wallet address and network for selected token
  const currentWalletAddress = useMemo(() => {
    if (!addresses) return "";
    const addressInfo = addresses.find((addr) => addr.chain === selectedToken);
    return addressInfo?.address || "";
  }, [addresses, selectedToken]);

  const currentNetwork = useMemo(() => {
    if (!addresses) return "testnet";
    const addressInfo = addresses.find((addr) => addr.chain === selectedToken);
    return addressInfo?.network || "testnet";
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
  const handleSendTransaction = async () => {
    if (validationError) {
      setTxStatus({
        type: "error",
        message: validationError,
      });
      return;
    }

    setIsSending(true);
    setTxStatus({ type: null, message: "" });

    try {
      const response = await sendTransaction({
        chain: selectedToken,
        network: currentNetwork,
        toAddress: toAddress.trim(),
        amount: amount,
        fromAddress: currentWalletAddress,
      });

      setTxStatus({
        type: "success",
        message: "Transaction sent successfully!",
        txHash: response.txHash,
      });

      // Reset form after 3 seconds
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
    } finally {
      setIsSending(false);
    }
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
    const explorerUrls: { [key: string]: { testnet: string; mainnet: string } } = {
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

  const isLoading = addressesLoading || balanceLoading;

  if (isLoading) {
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
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] flex flex-col items-center pl-5">
      <Card className="w-full max-w-md bg-Card mt-10 p-8 flex flex-col gap-6 rounded-xl items-center">
        {/* Header */}
        <div className="w-full flex flex-col gap-2 text-center">
          <h1 className="text-foreground text-xl font-bold">Send Funds</h1>
          <p className="text-muted-foreground text-sm">
            Transfer funds from your Velo wallet to any valid address
          </p>
        </div>

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
            <p
              className={`text-sm mt-1 ${
                txStatus.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
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

        {/* Selected Wallet Address */}
        {currentWalletAddress && (
          <div className="w-full flex flex-col gap-2 p-3 bg-accent/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                From Address:
              </span>
              <button
                onClick={handleCopyAddress}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy address"
              >
                {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <p className="text-xs font-mono text-foreground break-all">
              {shortenAddress(currentWalletAddress, 8)}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              Network: {currentNetwork}
            </p>
          </div>
        )}

        {/* Token Selector */}
        <div className="w-full flex flex-col gap-3 relative">
          <label className="text-foreground text-sm font-medium">
            Select Currency
          </label>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowTokenDropdown(!showTokenDropdown);
            }}
            className="w-full flex p-3 items-center justify-between rounded-lg bg-background border border-border cursor-pointer hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-Card flex items-center justify-center">
                <Image
                  src={`/${selectedToken.toLowerCase()}.svg`}
                  alt={selectedToken}
                  width={16}
                  height={16}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-foreground font-medium">
                {selectedTokenData?.name || selectedToken}
              </span>
              {!hasWalletForSelectedToken && (
                <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">
                  No Wallet
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`text-muted-foreground transition-transform ${
                showTokenDropdown ? "rotate-180" : ""
              }`}
            />
          </div>

          {showTokenDropdown && (
            <Card className="w-full absolute top-full flex flex-col text-muted-foreground left-0 z-50 mt-1 shadow-lg border border-border max-h-60 overflow-y-auto">
              {tokenOptions.map((token, id) => (
                <button
                  key={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTokenSelect(token.chain);
                  }}
                  className={`w-full rounded-md flex items-center gap-3 p-3 text-left hover:bg-hover hover:text-white transition-colors ${
                    selectedToken === token.chain ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                    <Image
                      src={`/${token.chain.toLowerCase()}.svg`}
                      alt={token.symbol}
                      width={16}
                      height={16}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{token.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Balance: {formatBalance(currentWalletBalance)}{" "}
                      {token.symbol}
                    </span>
                  </div>
                </button>
              ))}
            </Card>
          )}
        </div>

        {/* Recipient Address */}
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="toAddress"
            className="text-foreground text-sm font-medium"
          >
            Recipient Address
          </label>
          <input
            type="text"
            id="toAddress"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder={`Enter ${
              selectedTokenData?.name || selectedToken
            } address`}
            className="w-full p-3 rounded-lg bg-background border border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono text-sm"
            disabled={!hasWalletForSelectedToken || isSending}
          />
        </div>

        {/* Amount */}
        <div className="w-full flex flex-col gap-3">
          <label
            htmlFor="amount"
            className="text-foreground text-sm font-medium"
          >
            Amount
          </label>
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
              {selectedTokenData?.symbol}
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>
              Available: {formatBalance(currentWalletBalance)}{" "}
              {selectedTokenData?.symbol}
            </span>
            {ngnEquivalent > 0 && <span>≈ {formatNGN(ngnEquivalent)}</span>}
          </div>
        </div>

        {/* Send Button */}
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
              {validationError || "Send Funds"}
            </>
          )}
        </button>

        {/* Network Info */}
        <div className="w-full p-3 bg-accent/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Sending on{" "}
            <span className="font-medium capitalize">{currentNetwork}</span>{" "}
            network
          </p>
        </div>

        {/* Instructions */}
        <div className="w-full flex flex-col gap-3 p-4 bg-accent/30 rounded-lg">
          <h3 className="text-foreground text-sm font-medium">
            Important Notes
          </h3>
          <ul className="text-muted-foreground text-xs list-disc list-inside space-y-1">
            <li>Recipient does NOT need to be a Velo user</li>
            <li>Only send to valid addresses for the selected currency</li>
            <li>Transactions are irreversible once confirmed</li>
            <li>Double-check addresses before sending</li>
            {selectedToken === "starknet" && (
              <li className="text-warning">
                Starknet wallets may need deployment (auto-handled)
              </li>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
}