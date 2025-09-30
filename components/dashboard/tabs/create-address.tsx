"use client";

import { Card } from "@/components/ui/Card";
import { ChevronDown, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import React, { useState, useCallback, useEffect, ReactElement } from "react";
import { fixStarknetAddress, shortenAddress } from "@/components/lib/utils";
import Image from "next/image";
import QRCodeLib from "qrcode";
import { useWalletAddresses } from "@/components/hooks/useAddresses";

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
      let ethereumUri = `ethereum:${address}`;
      const ethereumParams = [];
      if (amount) {
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

    case 'erc20':
      return `ethereum:${address}`;
    case 'trc20':
      return `tron:${address}`;

    default:
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
    errorCorrectionLevel = 'M'
  } = options;

  try {
    const qrData = generateQRData(chain, address, amount, label);
    
    const qrCodeDataUrl = await QRCodeLib.toDataURL(qrData, {
      width,
      margin,
      errorCorrectionLevel,
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
    case 'erc20':
      return 'ERC-20 Token URI';
    case 'trc20':
      return 'TRC-20 Token URI';
    default:
      return 'Plain Address';
  }
};

export default function ReceiveFunds() {
  const [selectedToken, setSelectedToken] = useState("starknet");
  const [showDropdown, setShowDropdown] = useState(false);
  const [qrData, setQrData] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

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
    {
      symbol: (<Image src="/erc-usdt.svg" alt="erc20" width={16} height={16} />),
      name: "ERC20",
      walletAddress: addresses[4]?.address || "",
    },
    {
      symbol: (<Image src="/trc-usdt.svg" alt="trc20" width={16} height={16} />),
      name: "TRC20",
      walletAddress: addresses[5]?.address || "",
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
    <div className="w-full h-full transition-all duration-300 p-[10px] md:p-[20px_20px_20px_80px] flex flex-col items-center pl-5">
      <Card className="w-full max-w-md bg-Card mt-10 p-8 flex flex-col gap-6 rounded-xl items-center">
        {/* Header */}
        <div className="w-full flex flex-col gap-2 text-center">
          <h1 className="text-foreground text-xl font-bold">Receive Funds</h1>
          <p className="text-muted-foreground text-sm">
            Select a currency and share your address to receive payments
          </p>
        </div>

        {/* Token Selector */}
        <div className="w-full flex flex-col gap-3 relative">
          <label className="text-foreground text-sm font-medium">
            Select Currency
          </label>
          
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
            <Card className="w-full absolute top-full bg-stone-100 flex flex-col text-muted-foreground left-0 z-10 mt-1 shadow-lg border border-border">
              {tokenOptions.map((token, id) => (
                <button
                  key={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTokenSelect(token.name);
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-hover hover:text-white transition-colors ${
                    selectedToken === token.name ? "bg-accent" : ""
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
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
        <div className="w-full flex flex-col items-center gap-4 p-4 bg-white rounded-lg border border-border">
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

        {/* Instructions */}
        <div className="w-full flex flex-col gap-3 p-4 bg-accent/30 rounded-lg">
          <h3 className="text-foreground text-sm font-medium">
            How to receive funds
          </h3>
          <ul className="text-muted-foreground text-xs list-disc list-inside space-y-1">
            <li>Select the currency you want to receive</li>
            <li>Share your QR code or wallet address</li>
            <li>Wait for the sender to complete the transaction</li>
            <li>Funds will appear in your wallet after confirmation</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}