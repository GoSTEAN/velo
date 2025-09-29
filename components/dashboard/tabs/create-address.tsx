"use client";

import { Card } from "@/components/ui/Card";
import { ChevronDown, Copy, Check, Loader2, ExternalLink, Bell, BellOff } from "lucide-react";
import React, { useState, useCallback, useEffect, ReactElement } from "react";
import { fixStarknetAddress, shortenAddress } from "@/components/lib/utils";
import Image from "next/image";
import QRCodeLib from "qrcode";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import { useRealTimeMonitoring } from "@/components/hooks/useRealTimeMonitoring";
import { Transaction } from "@/types/multi-chain";

interface TokenOption {
  symbol: ReactElement;
  name: string;
  walletAddress: string;
}

// QR code format generators for different cryptocurrencies
const generateQRData = (chain: string, address: string, amount: string | null = null, label: string | null = null): string => {
  switch (chain.toLowerCase()) {
    case 'bitcoin':
    case 'btc':
      // Bitcoin URI scheme: bitcoin:address?amount=0.1&label=description
      let bitcoinUri = `bitcoin:${address}`;
      const bitcoinParams = [];
      if (amount) bitcoinParams.push(`amount=${amount}`);
      if (label) bitcoinParams.push(`label=${encodeURIComponent(label)}`);
      if (bitcoinParams.length > 0) {
        bitcoinUri += `?${bitcoinParams.join('&')}`;
      }
      return bitcoinUri;

    case 'ethereum':
    case 'eth':
      // Ethereum URI scheme: ethereum:address@chainId?value=amount
      let ethereumUri = `ethereum:${address}`;
      const ethereumParams = [];
      if (amount) {
        // Convert amount to wei (multiply by 10^18)
        const weiAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
        ethereumParams.push(`value=${weiAmount}`);
      }
      if (label) ethereumParams.push(`label=${encodeURIComponent(label)}`);
      if (ethereumParams.length > 0) {
        ethereumUri += `?${ethereumParams.join('&')}`;
      }
      return ethereumUri;

    case 'solana':
    case 'sol':
      // Solana URI scheme: solana:address?amount=1.5&label=description
      let solanaUri = `solana:${address}`;
      const solanaParams = [];
      if (amount) solanaParams.push(`amount=${amount}`);
      if (label) solanaParams.push(`label=${encodeURIComponent(label)}`);
      if (solanaParams.length > 0) {
        solanaUri += `?${solanaParams.join('&')}`;
      }
      return solanaUri;

    case 'starknet':
    case 'strk':
      // For Starknet, most wallets expect just the address or ethereum-style URI
      // Since it's EVM-compatible, we can use ethereum format
      let starknetUri = `starknet:${address}`;
      const starknetParams = [];
      if (amount) {
        const weiAmount = (parseFloat(amount) * Math.pow(10, 18)).toString();
        starknetParams.push(`value=${weiAmount}`);
      }
      if (label) starknetParams.push(`label=${encodeURIComponent(label)}`);
      if (starknetParams.length > 0) {
        starknetUri += `?${starknetParams.join('&')}`;
      }
      return starknetUri;

    default:
      // Fallback to plain address for unknown chains
      return address;
  }
};

// Enhanced QR code generation function
const generateCompatibleQRCode = async (
  chain: string, 
  address: string, 
  options: {
    amount?: string | null;
    label?: string | null;
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
) => {
  const {
    amount = null,
    label = null,
    width = 200,
    margin = 2,
    darkColor = "#000000",
    lightColor = "#FFFFFF",
    errorCorrectionLevel = 'M' // L, M, Q, H (Higher levels = more error correction)
  } = options;

  try {
    // Generate the appropriate URI format
    const qrData = generateQRData(chain, address, amount, label);
    
    // Generate QR code with enhanced settings for better scanning
    const qrCodeDataUrl = await QRCodeLib.toDataURL(qrData, {
      width,
      margin,
      errorCorrectionLevel, // Higher error correction for better scanning
      type: 'image/png' as 'image/png' | 'image/jpeg' | 'image/webp',
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });

    return {
      dataUrl: qrCodeDataUrl,
      rawData: qrData,
      format: getQRFormat(chain)
    };
  } catch (error) {
    console.error("Error generating compatible QR code:", error);
    throw error;
  }
};

// Helper function to get the format description
const getQRFormat = (chain: string): string => {
  switch (chain.toLowerCase()) {
    case 'bitcoin':
    case 'btc':
      return 'BIP21 Bitcoin URI';
    case 'ethereum':
    case 'eth':
      return 'EIP681 Ethereum URI';
    case 'solana':
    case 'sol':
      return 'Solana URI Scheme';
    case 'starknet':
    case 'strk':
      return 'Ethereum-compatible URI';
    default:
      return 'Plain Address';
  }
};

const getExplorerUrl = (chain: string, transactionHash: string, ): string => {
  switch (chain.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      return `https://sepolia.etherscan.io/tx/${transactionHash}`;
    case 'starknet':
    case 'strk':
      return `https://sepolia.starkscan.co/tx/${transactionHash}`;
    case 'solana':
    case 'sol':
      return `https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`;
    case 'polygon':
      return `https://mumbai.polygonscan.com/tx/${transactionHash}`;
    default:
      return '#';
  }
};

const TransactionNotification: React.FC<{
  transaction: Transaction;
  chain: string;
  onClose: () => void;
}> = ({ transaction, chain, onClose }) => {
  const explorerUrl = getExplorerUrl(chain, transaction.hash);

  return (
    <Card className="p-4 mb-3 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Check size={16} className="text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-300">
              New Transaction Received!
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-400 mb-2">
            {transaction.amount} {transaction.tokenSymbol} from {shortenAddress(transaction.from, 6)}
          </p>
          <div className="flex gap-2">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
            >
              View on Explorer <ExternalLink size={12} />
            </a>
            <button
              onClick={onClose}
              className="text-xs text-green-600 dark:text-green-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function ReceiveFunds() {
  const [selectedToken, setSelectedToken] = useState("starknet");
  const [showDropdown, setShowDropdown] = useState(false);
  const [qrData, setQrData] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dismissedTransactions, setDismissedTransactions] = useState<Set<string>>(new Set());

  const { addresses, loading: addressesLoading } = useWalletAddresses();

    const fixedAddresses = addresses ? addresses.map(addr => {
    if (addr.chain.toLowerCase() === 'starknet' && addr.address) {
      return {
        ...addr,
        address: fixStarknetAddress(addr.address)
      };
    }
    return addr;
  }) : addresses;

  
  // Get the current wallet address for the selected token
  const currentWalletAddress = addresses?.find(addr => 
    addr.chain.toLowerCase() === selectedToken.toLowerCase()
  )?.address || '';

  // Use the real-time monitoring hook
   const {
    transactions,
    // latestTransaction,
    hasNewTransactions,
    isLoading: isMonitoring,
    error: monitoringError,
    refresh: refreshMonitoring,
  } = useRealTimeMonitoring(selectedToken, currentWalletAddress, {
    pollInterval: 15000,
  });


  // Filter out dismissed transactions
  const visibleTransactions = transactions.filter(
    tx => !dismissedTransactions.has(tx.hash)
  );

  const dismissTransaction = useCallback((txHash: string) => {
    setDismissedTransactions(prev => new Set(prev).add(txHash));
  }, []);

  // Check if wallet addresses are available before rendering
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setLoading(false);
    } else if (!addressesLoading) {
      setLoading(false);
    }
  }, [addresses, addressesLoading]);

  const tokenOptions: TokenOption[] = addresses ? [
    {
      symbol: (<Image src="/solana.svg" alt="sol" width={16} height={16} />),
      name: addresses[2]?.chain || "SOL",
      walletAddress: addresses[2]?.address || "",
    },
    {
      symbol: (<Image src="/ethereum.svg" alt="eth" width={16} height={16} />),
      name: addresses[0]?.chain || "ETH",
      walletAddress: addresses[0]?.address || "",
    },
    {
      symbol: (<Image src="/bitcoin.svg" alt="btc" width={16} height={16} />),
      name: addresses[1]?.chain || "BTC",
      walletAddress: addresses[1]?.address || "",
    },
    {
      symbol: (<Image src="/starknet.svg" alt="strk" width={16} height={16} />),
      name: addresses[3]?.chain || "STRK",
      walletAddress: fixedAddresses[3]?.address || "",
    },
  ] : [];

  const selectedTokenData = tokenOptions.find(
    (token) => token.name === selectedToken
  );

  // Generate QR code when selected token changes using enhanced function
useEffect(() => {
    if (selectedTokenData && selectedTokenData.walletAddress) {
      const generateQrCode = async () => {
        try {
          // For Starknet, ensure the address is properly formatted
          let addressToUse = selectedTokenData.walletAddress;
          if (selectedTokenData.name.toLowerCase() === 'starknet') {
            addressToUse = fixStarknetAddress(addressToUse);
          }

          const qrResult = await generateCompatibleQRCode(
            selectedTokenData.name, 
            addressToUse,
            {
              width: 200,
              margin: 2,
              errorCorrectionLevel: 'M', 
            }
          );
          
          setQrData(qrResult.dataUrl);
        } catch (error) {
          console.error("Error generating QR code:", error);
        }
      };

      generateQrCode();
    }
  }, [selectedTokenData]);

  const handleTokenSelect = useCallback((symbol: string) => {
    setSelectedToken(symbol);
    setShowDropdown(false);
    // Clear dismissed transactions when changing tokens
    setDismissedTransactions(new Set());
  }, []);

  const handleCopyAddress = useCallback(async () => {
    if (!selectedTokenData) return;

    try {
      await navigator.clipboard.writeText(selectedTokenData.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address: ", err);
    }
  }, [selectedTokenData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  // Show loading state while addresses are being fetched
  if (loading || addressesLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading wallet addresses...</p>
        </div>
      </div>
    );
  }

  // Show error state if no addresses are available
  if (!addresses || addresses.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center gap-4 max-w-md">
          <h2 className="text-xl font-bold text-foreground">No Wallet Addresses</h2>
          <p className="text-muted-foreground text-center">
            Unable to retrieve wallet addresses. Please check your connection and try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-all duration-300 mb-20 lg:mb-0 p-[10px] md:p-[20px_20px_20px_80px] flex flex-col items-center pl-5">
      <Card className="w-full max-w-md border-border/80 mb-8 bg-card/50 backdrop-blur-sm mt-10 p-8 flex flex-col gap-6 rounded-xl items-center">
        {/* Notifications Toggle */}
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col gap-2 text-center flex-1">
            <h1 className="text-foreground text-xl font-bold">Receive Funds</h1>
            <p className="text-muted-foreground text-sm">
              Select a currency and share your address to receive payments
            </p>
          </div>
          
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`p-2 rounded-full ${
              notificationsEnabled 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
            }`}
            title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
          >
            {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
        </div>

        {/* Transaction Notifications */}
        {notificationsEnabled && visibleTransactions.length > 0 && (
          <div className="w-full">
            {visibleTransactions.map((transaction) => (
              <TransactionNotification
                key={transaction.hash}
                transaction={transaction}
                chain={selectedToken}
                onClose={() => dismissTransaction(transaction.hash)}
              />
            ))}
          </div>
        )}

        {/* Monitoring Status */}
        {monitoringError && (
          <Card className="w-full p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 text-sm">
              Monitoring error: {monitoringError}
            </p>
          </Card>
        )}

        {/* Token Selector */}
        <div className="w-full flex flex-col gap-3 relative">
          <div className="flex justify-between items-center">
            <label className="text-foreground text-sm font-medium">
              Select Currency
            </label>
            {isMonitoring && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Monitoring...
              </div>
            )}
          </div>
          
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="w-full flex p-3 items-center justify-between rounded-lg bg-background border border-border cursor-pointer hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold">
                  <Image 
                    src={`/${selectedToken.toLowerCase()}.svg`} 
                    alt={selectedToken} 
                    width={16} 
                    height={16} 
                  />
                </span>
              </div>
              <span className="text-foreground font-medium">
                {selectedToken}
                {hasNewTransactions && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                )}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-muted-foreground transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          </div>

          {showDropdown && (
            <Card className="w-full absolute top-full flex flex-col text-muted-foreground left-0 z-10 mt-1 shadow-lg border border-border/50">
              {tokenOptions.map((token, id) => (
                <button
                  key={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTokenSelect(token.name);
                  }}
                  className={`w-full rounded-md flex items-center gap-3 p-3 text-left hover:bg-hover hover:text-white transition-colors ${
                    selectedToken === token.name ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    {token.symbol}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {token.name}
                    </span>
                    <span className="text-xs">
                      {shortenAddress(token.walletAddress, 6)}
                    </span>
                  </div>
                </button>
              ))}
            </Card>
          )}
        </div>

        {/* QR Code */}
        <div className="w-full flex flex-col items-center gap-4 p-4 border-border/50 mb-8 bg-card/50 backdrop-blur-sm rounded-lg border ">
          {qrData ? (
            <div className="w-40 h-40 relative">
              <Image src={qrData} alt="QR Code" width={160} height={160} />
            </div>
          ) : (
            <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded">
              <span className="text-muted-foreground">Loading QR...</span>
            </div>
          )}

          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">
              {selectedToken} Address
            </p>
            <div className="flex items-center gap-2">
              <p className="text-foreground text-sm font-mono">
                {shortenAddress(selectedTokenData?.walletAddress || "", 10)}
              </p>
              <button
                onClick={handleCopyAddress}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy address"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Instructions with Monitoring Info */}
        <div className="w-full flex flex-col border gap-3 p-4 border-border/30 mb-8 bg-card/50 backdrop-blur-sm rounded-lg shadow-xs">
          <h3 className="text-foreground text-sm font-medium">
            How to receive funds
          </h3>
          <ul className="text-muted-foreground text-xs list-disc list-inside space-y-1">
            <li>Select the currency you want to receive</li>
            <li>Share your QR code or wallet address</li>
            <li>Wait for the sender to complete the transaction</li>
            <li>Funds will appear in your wallet after confirmation</li>
            {notificationsEnabled && (
              <li className="text-green-600 dark:text-green-400">
                ✓ Real-time monitoring enabled - you&apos;ll be notified of incoming transactions
              </li>
            )}
          </ul>
          
          {/* Transaction History Summary */}
          {transactions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Recent transactions: {transactions.length} found
              </p>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshMonitoring}
          disabled={isMonitoring}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isMonitoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking for transactions...
            </>
          ) : (
            'Check for new transactions'
          )}
        </button>
      </Card>
    </div>
  );
}