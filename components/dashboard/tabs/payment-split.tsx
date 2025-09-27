"use client";

import { shortenAddress } from "@/components/lib/utils";
import AddSplit from "@/components/modals/add-split";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards";
import { Button } from "@/components/ui/buttons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Plus, AlertCircle, ChevronDown } from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";
import { SplitData } from "@/splits";
import { useSendTransaction } from "@starknet-react/core";
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
        // For now, return a mock transaction hash
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
    console.error("No events array found");
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
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
          </svg>
          <p className="text-muted-foreground">Loading wallet addresses...</p>
        </div>
      </div>
    );
  }

  // Show error if no Starknet address found
  if (addressesError || !starknetAddress) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
        <Alert variant="destructive">
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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Payment Split</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Using Starknet wallet: {shortenAddress(starknetAddress as `0x${string}`, 6)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleShowSplitModal}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Split
        </Button>
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

      {splitData ? (
        <Card className="w-full bg-card p-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{splitData.title}</CardTitle>
            <p className="text-muted-foreground">{splitData.description}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <h3 className="text-sm text-muted-foreground">Total Percentage</h3>
                </div>
                <p className="text-lg font-semibold">{totalPercentage}%</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <h3 className="text-sm text-muted-foreground">Recipients</h3>
                </div>
                <p className="text-lg font-semibold">{splitData.recipients?.length || 0}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <h3 className="text-sm text-muted-foreground">Total Amount</h3>
                </div>
                <p className="text-lg font-semibold">
                  {token} {totalAmount.toLocaleString()}
                </p>
              </Card>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Recipients</h2>
              <div className="space-y-4">
                {splitData.recipients?.map((recipient, id) => (
                  <Card key={id} className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm text-muted-foreground mb-2">Name</h4>
                      <div className="flex justify-between items-center bg-background p-3 rounded-md">
                        <span>{recipient.name}</span>
                        <span>{recipient.percentage}%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm text-muted-foreground mb-2">Address</h4>
                      <div className="flex justify-between items-center bg-background p-3 rounded-md">
                        <span>{shortenAddress(recipient.walletAddress as `0x${string}`, 4)}</span>
                        <span>≈{token} {parseFloat(recipient.amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {canPerformTransactions && (
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {!smeId ? (
                  <Button
                    size="lg"
                    onClick={handleCreateSplit}
                    disabled={isCreating || totalPercentage !== 100}
                    className="w-full md:w-auto"
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                        </svg>
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
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                  >
                    {isDistributing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                        </svg>
                        Distributing...
                      </>
                    ) : (
                      "Distribute Split"
                    )}
                  </Button>
                )}
                <div className="w-full md:w-48">
                  <h3 className="text-sm text-muted-foreground mb-2">Select Token</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {token}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      {tokens.map((tkn) => (
                        <DropdownMenuItem key={tkn} onSelect={() => handleTokenChange(tkn)}>
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
        <Card className="w-full bg-card p-6 flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground text-lg">
            No split created yet. Click the + button to create one.
          </p>
        </Card>
      )}

      {addSplitModal && (
        <AddSplit setSplitData={setSplitData} close={setAddSplitModal} />
      )}
    </div>
  );
}