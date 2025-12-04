"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Copy, Check } from "lucide-react";
import { AddressDropdown } from "@/components/modals/addressDropDown";
import { useWalletData } from "@/components/hooks/useWalletData";

// Import the new utilities and components
import { 
  generateCompatibleQRCode,
  getCurrencySymbol 
} from "@/lib/utils/qr-utils";
import { CardContainer } from "@/components/ui/CardContainer";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/LoadingState";
import { AddressCopyButton } from "@/components/ui/AddressCopyButton";
import { InstructionCard } from "@/components/ui/CardContainer";
import { fixStarknetAddress, shortenAddress } from "@/components/lib/utils";

export default function ReceiveFunds() {
  const [selectedToken, setSelectedToken] = useState("starknet");
  const [qrData, setQrData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const { addresses } = useWalletData();

  // Get selected token data
  const selectedTokenData = addresses?.find(
    (token) => token.chain === selectedToken
  );

  // Generate QR code when selected token changes
  useEffect(() => {
    const generateQrCode = async () => {
      if (!selectedTokenData?.address) {
        setQrData("");
        return;
      }

      try {
        let addressToUse = selectedTokenData.address;
        
        // Normalize Starknet address if needed
        if (selectedTokenData.chain.toLowerCase() === "starknet") {
          addressToUse = fixStarknetAddress(
            addressToUse,
            selectedTokenData.chain
          );
        }

        const qrResult = await generateCompatibleQRCode(
          selectedTokenData.chain,
          addressToUse,
          {
            width: 200,
            margin: 2,
            errorCorrectionLevel: "M" as const,
          }
        );

        setQrData(qrResult.dataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
        setQrData("");
      }
    };

    generateQrCode();
  }, [selectedTokenData]);

  // Check if wallet addresses are available
  useEffect(() => {
    if (addresses) {
      setIsLoading(false);
    }
  }, [addresses]);

  // Handle token selection
  const handleTokenSelect = useCallback((symbol: string) => {
    setSelectedToken(symbol);
  }, []);

  // Prepare shortened address for display
  const getDisplayAddress = () => {
    if (!selectedTokenData?.address) return "";
    
    const normalizedAddress = fixStarknetAddress(
      selectedTokenData.address,
      selectedTokenData.chain
    );
    
    return shortenAddress(normalizedAddress, 10);
  };

  // Loading state
  if (isLoading || addresses.length < 1) {
    return (
      <LoadingState message="Loading wallet addresses..." />
    );
  }

  // Empty state
  if (!addresses || addresses.length === 0) {
    return (
      <EmptyState
        icon={Copy}
        title="No Wallet Addresses"
        description="Unable to retrieve wallet addresses. Please check your connection and try again."
      />
    );
  }

  const instructions = [
    "Select the currency you want to receive",
    "Share your QR code or wallet address",
    "Wait for the sender to complete the transaction",
    "Funds will appear in your wallet after confirmation",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6 mt-10 md:mt-10">
      <div className="space-y-6">
        {/* Main Card */}
        <CardContainer>
          {/* Header */}
          <div className="w-full flex flex-col gap-2 text-center mb-6">
            <h1 className="text-foreground text-xl font-bold">Receive Funds</h1>
            <p className="text-muted-foreground text-sm">
              Select a currency and share your address to receive payments
            </p>
          </div>

          {/* Token Selector */}
          <div className="mb-8">
            <AddressDropdown
              selectedToken={selectedToken}
              onTokenSelect={handleTokenSelect}
              showBalance={true}
              showNetwork={false}
              showAddress={true}
            />
          </div>

          {/* QR Code Display */}
          <div className="w-full flex flex-col items-center gap-4 p-6 mb-8 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-border/8 border border-border/8">
            {qrData ? (
              <div className="w-40 h-40 relative">
                <Image 
                  src={qrData} 
                  alt="QR Code" 
                  width={160} 
                  height={160}
                  className="rounded-lg"
                  priority
                />
              </div>
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-muted-foreground">Loading QR...</span>
              </div>
            )}

            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">
                {getCurrencySymbol(selectedTokenData?.chain || selectedToken)} Address
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-foreground text-sm font-mono">
                  {getDisplayAddress()}
                </p>
                
                {/* Using AddressCopyButton component */}
                <AddressCopyButton 
                  address={selectedTokenData?.address || ""}
                  chain={selectedTokenData?.chain || selectedToken}
                  size="sm"
                  showIcon={true}
                  showText={false}
                />
              </div>
              
              {/* Network info */}
              {selectedTokenData?.network && (
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  Network: {selectedTokenData.network}
                </p>
              )}
            </div>
          </div>
        </CardContainer>

        {/* Instructions Card */}
        <InstructionCard
          title="How to receive funds"
          items={instructions}
        />
      </div>
    </div>
  );
}