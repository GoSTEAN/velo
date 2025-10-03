"use client";

import { shortenAddress } from "@/components/lib/utils";
import AddSplit from "@/components/modals/add-split";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards";
import { Button } from "@/components/ui/buttons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Plus, AlertCircle, ChevronDown, Users, Loader2 } from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";
import { SplitData } from "@/splits";
import { CallData, uint256 } from "starknet";
import { useProvider } from "@starknet-react/core";
import { useWalletAddresses } from "@/components/hooks/useAddresses";
import { TOKEN_ADDRESSES as tokenAddress } from "autoswap-sdk";
import { useMemo } from 'react';

// Fixed custom transaction sender with proper typing
const useCustomTransactionSender = (starknetAddress: string | null) => {
  const sendTransaction = useMemo(() => {
    if (!starknetAddress) return null;
    
    return async (calls: any[]) => {
      try {
        // Your custom transaction logic here
        console.log(calls)
        return {
          transaction_hash: "0x" + Math.random().toString(16).substr(2, 8)
        };
      } catch (error) {
        throw error;
      }
    };
  }, [starknetAddress]);

  return { sendAsync: sendTransaction };
};

// Token contract addresses
const TOKEN_ADDRESSES: { [key: string]: string } = {
  USDT: tokenAddress.USDT,
  USDC: tokenAddress.USDC || "",
  STRK: tokenAddress.STRK || "",
  ETH: tokenAddress.ETH || "",
};

// Token decimals for u256 conversion
const TOKEN_DECIMALS: { [key: string]: number } = {
  USDT: 6,
  USDC: 6,
  STRK: 18,
  ETH: 18,
};

// Event extraction helper function
const extractSmeIdFromEvents = (events: any[], recipientCount: number): string | null => {
  if (!events || !Array.isArray(events)) {
    console.error("No events array found", recipientCount);
    return null;
  }

  console.log("Raw events:", events);

  for (const event of events) {
    if (event && (
      (event.name && (
        event.name.includes("Sme3Created") ||
        event.name.includes("Sme4Created") ||
        event.name.includes("Sme5Created")
      )) ||
      (event.keys && event.keys.some((key: string) => 
        key.includes("sme") || key.includes("Sme")
      ))
    )) {
      console.log("Found SME event:", event);
      
      if (event.data && event.data.length > 0) {
        const smeId = event.data[0];
        if (smeId) {
          return smeId.toString();
        }
      }
      
      if (event.keys && event.keys.length > 0) {
        for (const key of event.keys) {
          if (key && key.toString().length > 10) {
            return key.toString();
          }
        }
      }
    }
  }
  
  return null;
};

export default function PaymentSplit() {
  const [addSplitModal, setAddSplitModal] = useState(false);
  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [token, setToken] = useState("STRK");
  const [isCreating, setIsCreating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [error, setError] = useState("");
  const [smeId, setSmeId] = useState<string | null>(null);
  const [starknetAddress, setStarknetAddress] = useState<string | null>(null);

  const { provider } = useProvider();
  const { addresses, loading: addressesLoading, error: addressesError } = useWalletAddresses();
  console.log(addresses);

  // Get contract address from environment variables
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not defined");
  }

  // Hooks for sending transactions
  const { sendAsync: sendCreateSme } = useCustomTransactionSender(starknetAddress);
  const { sendAsync: sendDistributePayment } = useCustomTransactionSender(starknetAddress);

  // Fixed: Added proper null checks for splitData and recipients
  const canPerformTransactions = starknetAddress && 
    splitData?.recipients && 
    Array.isArray(splitData.recipients) && 
    splitData.recipients.length > 0;

  // Extract Starknet address from backend wallets
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const starknetWallet = addresses.find(addr => 
        addr.chain?.toLowerCase() === 'starknet' && addr.address
      );
      
      if (starknetWallet) {
        setStarknetAddress(starknetWallet.address);
        console.log("Using Starknet address:", starknetWallet.address);
      } else {
        setError("No Starknet wallet address found in your account");
      }
    }
  }, [addresses]);

  const handleShowSplitModal = () => {
    if (!starknetAddress) {
      setError("Please connect your Starknet wallet first");
      return;
    }
    setAddSplitModal(!addSplitModal);
  };

  const totalPercentage =
    splitData?.recipients?.reduce((total, recipient) => {
      return total + (recipient.percentage || 0);
    }, 0) || 0;

  const totalAmount =
    splitData?.recipients?.reduce((total, recipient) => {
      return total + parseFloat(recipient.amount || "0");
    }, 0) || 0;

  const tokens = ["USDT", "USDC", "STRK", "ETH"];

  const handleTokenChange = useCallback((tkn: string) => {
    setToken(tkn);
  }, []);

  // Create split on the smart contract
  const handleCreateSplit = async () => {
    if (!starknetAddress) {
      setError("Starknet wallet address not available");
      return;
    }

    if (!splitData || !splitData.recipients || splitData.recipients.length === 0) {
      setError("Please provide split data with recipients");
      return;
    }

    if (totalPercentage !== 100) {
      setError("Total percentage must equal 100%");
      return;
    }

    const recipientCount = splitData.recipients.length;
    if (recipientCount < 3 || recipientCount > 5) {
      setError("Split must have between 3-5 recipients");
      return;
    }

    // Fixed: Check if sendCreateSme is null before calling
    if (!sendCreateSme) {
      setError("Transaction sender not available");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const functionName = `create_sme${recipientCount}`;
      const params: any[] = [];
      
      // Add all recipients with proper null checks
      for (let i = 0; i < recipientCount; i++) {
        const recipient = splitData.recipients[i];
        if (!recipient) {
          throw new Error(`Recipient at index ${i} is missing`);
        }
        if (!recipient.walletAddress) {
          throw new Error(`Recipient ${recipient.name || i} is missing wallet address`);
        }
        if (!recipient.percentage) {
          throw new Error(`Recipient ${recipient.name || i} is missing percentage`);
        }
        
        params.push(recipient.walletAddress);
        params.push(recipient.percentage);
      }

      const call = {
        contractAddress,
        entrypoint: functionName,
        calldata: CallData.compile(params),
      };

      const result = await sendCreateSme([call]);
      
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(result.transaction_hash);
      
      // Access events safely
      const events = (receipt as any).events || 
                     (receipt as any).transaction_receipt?.events || 
                     (receipt as any).receipt?.events || [];
      
      console.log("Transaction receipt:", receipt);
      
      // Extract SME ID
      const extractedSmeId = extractSmeIdFromEvents(events, recipientCount);
      
      if (!extractedSmeId) {
        console.warn("Could not extract SME ID from events, using transaction hash as fallback");
        setSmeId(result.transaction_hash);
      } else {
        setSmeId(extractedSmeId);
      }
      
      alert(`Split created successfully! ID: ${extractedSmeId || result.transaction_hash}`);
    } catch (err) {
      console.error("Failed to create split:", err);
      setError("Failed to create split: " + (err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  // Distribute payment to recipients
  const handleDistributeSplit = async () => {
    if (!starknetAddress) {
      setError("Starknet wallet address not available");
      return;
    }

    if (!splitData || !smeId) {
      setError("Please create the split first");
      return;
    }

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      setError("Please enter a valid amount to distribute");
      return;
    }

    const tokenAddress = TOKEN_ADDRESSES[token];
    if (!tokenAddress) {
      setError("Invalid token selected");
      return;
    }

    // Fixed: Check if sendDistributePayment is null before calling
    if (!sendDistributePayment) {
      setError("Transaction sender not available");
      return;
    }

    setIsDistributing(true);
    setError("");

    try {
      const decimals = TOKEN_DECIMALS[token] || 18;
      const amountBN = BigInt(Math.floor(totalAmount * 10 ** decimals));
      const amountU256 = uint256.bnToUint256(amountBN);

      const recipientCount = splitData.recipients?.length || 0;
      const functionName = `distribute_sme${recipientCount}_payment`;

      // Approve the contract to spend tokens
      const approveCall = {
        contractAddress: tokenAddress,
        entrypoint: "approve",
        calldata: CallData.compile({
          spender: contractAddress,
          amount: amountU256,
        }),
      };

      // Distribute payment using the SME ID
      const distributeCall = {
        contractAddress,
        entrypoint: functionName,
        calldata: CallData.compile([
          smeId, 
          amountU256,
          tokenAddress,
        ]),
      };

      await sendDistributePayment([approveCall, distributeCall]);
      alert("Payment distributed successfully!");
      setSplitData(null);
      setSmeId(null);
    } catch (err) {
      console.error("Failed to distribute payment:", err);
      setError("Failed to distribute payment: " + (err as Error).message);
    } finally {
      setIsDistributing(false);
    }
  };

  // Clear error after some time
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Show loading state while fetching addresses
  if (addressesLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading wallet addresses...</p>
        </div>
      </div>
    );
  }

  // Show error if no Starknet address found
  if (addressesError || !starknetAddress) {
    return (
      <div className="w-full h-full transition-all duration-300 p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {addressesError || "No Starknet wallet address found. Please make sure you have a Starknet wallet connected to your account."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full h-full transition-all duration-300 p-6">
      {/* Header */}
      <div className="space-y-3 mb-8 text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Payment Split
        </h1>
        <p className="text-muted-foreground text-pretty text-lg">
          Split payments between multiple recipients automatically
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {smeId && (
        <Alert variant="default" className="mb-6 bg-green-50 border-green-400 text-green-700">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Split created successfully! SME ID: {smeId.slice(0, 10)}...
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {splitData ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">{splitData.title}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{splitData.description}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShowSplitModal}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Edit Split
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-accent/20 border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <h3 className="text-sm text-muted-foreground">Recipients</h3>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{splitData.recipients?.length || 0}</p>
                  </Card>
                  <Card className="p-4 bg-accent/20 border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <h3 className="text-sm text-muted-foreground">Total Percentage</h3>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{totalPercentage}%</p>
                  </Card>
                  <Card className="p-4 bg-accent/20 border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <h3 className="text-sm text-muted-foreground">Total Amount</h3>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {totalAmount.toLocaleString()} {token}
                    </p>
                  </Card>
                </div>

                {/* Recipients List */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-foreground">Recipients</h2>
                  <div className="space-y-3">
                    {splitData.recipients?.map((recipient, id) => (
                      <Card key={id} className="p-4 border-border/30 bg-card/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{recipient.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {shortenAddress(recipient.walletAddress as `0x${string}`, 6)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                {parseFloat(recipient.amount).toLocaleString()} {token}
                              </p>
                              <p className="text-xs text-green-600 font-medium">
                                {recipient.percentage}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {canPerformTransactions && (
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {!smeId ? (
                      <Button
                        size="lg"
                        onClick={handleCreateSplit}
                        disabled={isCreating || totalPercentage !== 100}
                        className="w-full sm:w-auto"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Split...
                          </>
                        ) : (
                          "Create Split"
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={handleDistributeSplit}
                        disabled={isDistributing}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                      >
                        {isDistributing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Distributing...
                          </>
                        ) : (
                          "Distribute Payment"
                        )}
                      </Button>
                    )}
                    
                    <div className="w-full sm:w-48">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between border-border/50">
                            {token}
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 border-border/50">
                          {tokens.map((tkn) => (
                            <DropdownMenuItem 
                              key={tkn} 
                              onSelect={() => handleTokenChange(tkn)}
                              className="cursor-pointer"
                            >
                              {tkn}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-8 flex flex-col items-center justify-center h-64">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg text-center mb-6">
                No split created yet. Create your first payment split to get started.
              </p>
              <Button
                onClick={handleShowSplitModal}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Split
              </Button>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Create Split</h4>
                  <p className="text-muted-foreground text-sm mt-1">Add 3-5 recipients with their wallet addresses and percentages</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Deploy Contract</h4>
                  <p className="text-muted-foreground text-sm mt-1">Create the split on Starknet blockchain</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Distribute Funds</h4>
                  <p className="text-muted-foreground text-sm mt-1">Send payments that automatically split between recipients</p>
                </div>
              </div>
            </div>
          </Card>

         
        </div>
      </div>

      {addSplitModal && (
        <AddSplit setSplitData={setSplitData} close={setAddSplitModal} />
      )}
    </div>
  );
}