"use client";

import { Plus, Trash2, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Recipient } from "@/splits";
import { useWalletData } from "@/components/hooks/useWalletData"; // CHANGED
import { useSplitPayments } from "@/components/hooks/useSplitPayments"; // NEW

interface AddSplitProps {
  close: (value: boolean) => void;
  onSuccess?: () => void;
}

export default function AddSplit({ close, onSuccess }: AddSplitProps) {
  // CHANGED: Use wallet data hook instead of addresses hook
  const { addresses } = useWalletData();
  
  // NEW: Use split payments hook instead of AuthContext
  const { createSplitPayment, isLoading: createLoading } = useSplitPayments();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chain, setChain] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  
  const [currentRecipient, setCurrentRecipient] = useState({
    name: "",
    walletAddress: "",
    amount: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const network = "mainnet";

  // CHANGED: Use addresses from useWalletData
  const availableChains = [...new Set(addresses.map(a => a.chain))];

  const fromOptions = addresses.filter(a => a.chain === chain).map(a => a.address);

  useEffect(() => {
    if (availableChains.length > 0 && !chain) {
      setChain(availableChains[0]);
    }
  }, [availableChains, chain]);

  useEffect(() => {
    if (fromOptions.length > 0 && !fromAddress) {
      setFromAddress(fromOptions[0]);
    }
  }, [fromOptions, fromAddress]);

  const isValidWalletAddress = (address: string, selectedChain: string): boolean => {
    const chainLower = selectedChain.toLowerCase();
    if (chainLower === 'starknet') {
      return /^0x[a-fA-F0-9]{64}$/.test(address);
    } else if (chainLower === 'ethereum' || chainLower === 'usdt_erc20') {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } else if (chainLower === 'bitcoin') {
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
    } else if (chainLower === 'solana') {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }
    return false;
  };

  const isValidAmount = (amount: string): boolean => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!chain) {
      newErrors.chain = "Chain is required";
    }

    if (!fromAddress) {
      newErrors.fromAddress = "From address is required";
    }

    if (recipients.length < 3) {
      newErrors.recipients = "At least 3 recipients are required";
    } else if (recipients.length > 50) {
      newErrors.recipients = "Maximum 50 recipients allowed";
    }

    recipients.forEach((recipient, index) => {
      if (!recipient.name.trim()) {
        newErrors[`recipient-${index}-name`] = "Name is required";
      }
      
      if (!isValidWalletAddress(recipient.walletAddress, chain)) {
        newErrors[`recipient-${index}-wallet`] = `Invalid wallet address for ${chain}`;
      }
      
      if (!isValidAmount(recipient.amount)) {
        newErrors[`recipient-${index}-amount`] = "Amount must be a positive number";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentRecipient = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!currentRecipient.name.trim()) {
      newErrors.currentName = "Name is required";
    }
    
    if (!isValidWalletAddress(currentRecipient.walletAddress, chain)) {
      newErrors.currentWallet = `Invalid wallet address for ${chain}`;
    }
    
    if (!isValidAmount(currentRecipient.amount)) {
      newErrors.currentAmount = "Amount must be a positive number";
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const addRecipient = () => {
    if (recipients.length >= 50) {
      setErrors({...errors, recipients: "Maximum 50 recipients allowed"});
      return;
    }

    if (!validateCurrentRecipient()) return;

    setRecipients(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: currentRecipient.name,
        walletAddress: currentRecipient.walletAddress,
        amount: currentRecipient.amount
      }
    ]);

    setCurrentRecipient({
      name: "",
      walletAddress: "",
      amount: ""
    });

    setErrors(prev => {
      const { currentName, currentWallet, currentAmount, ...rest } = prev;
      return rest;
    });
  };

  const removeRecipient = (id: string) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  // UPDATED: Handle submit using the new hook
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const data = {
        title,
        description,
        chain,
        network,
        fromAddress,
        recipients: recipients.map(r => ({
          address: r.walletAddress,
          amount: r.amount,
          name: r.name
        }))
      };

      // CHANGED: Use createSplitPayment from hook instead of AuthContext
      await createSplitPayment(data);
      
      close(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create split payment:", error);
      setErrors({ ...errors, submit: "Failed to create split payment. Please try again." });
    }
  };

  const totalAmount = recipients.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);

  const recipientsWithPercentages = recipients.map(r => ({
    ...r,
    percentage: totalAmount > 0 ? ((parseFloat(r.amount) / totalAmount) * 100).toFixed(1) : "0"
  }));


  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 bg-card/50 border-border/30 shadow-2xl">
        <CardHeader className="border-b border-border/30">
          <CardTitle className="text-2xl font-bold text-foreground">
            Create New Split Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Community Airdrop"
                className="bg-background/50 border-border/30"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Airdrop for early supporters"
                className="bg-background/50 border-border/30"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Chain</label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full bg-background/50 border-border/30 rounded-md p-2"
              >
                <option value="">Select chain</option>
                {availableChains.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
              {errors.chain && <p className="text-red-500 text-xs mt-1">{errors.chain}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">From Address</label>
              <select
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                className="w-full bg-background/50 border-border/30 rounded-md p-2"
                disabled={!chain }
              >
                <option value="">Select from address</option>
                {fromOptions.map(addr => (
                  <option key={addr} value={addr}>{addr}</option>
                ))}
              </select>
              {errors.fromAddress && <p className="text-red-500 text-xs mt-1">{errors.fromAddress}</p>}
            </div>
          </div>

          <div className="flex flex-col w-full lg:flex-row gap-3">
            {/* Add Recipient */}
            <Card className="bg-card/30 w-full border-border/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Add Recipient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <Input
                    value={currentRecipient.name}
                    onChange={(e) => setCurrentRecipient({...currentRecipient, name: e.target.value})}
                    placeholder="e.g. Early Supporter 1"
                    className="bg-background/50 border-border/30"
                    
                  />
                  {errors.currentName && <p className="text-red-500 text-xs mt-1">{errors.currentName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Wallet Address</label>
                  <Input
                    value={currentRecipient.walletAddress}
                    onChange={(e) => setCurrentRecipient({...currentRecipient, walletAddress: e.target.value})}
                    placeholder="e.g. 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                    className="bg-background/50 border-border/30 font-mono"
                    
                  />
                  {errors.currentWallet && <p className="text-red-500 text-xs mt-1">{errors.currentWallet}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Amount</label>
                  <Input
                    value={currentRecipient.amount}
                    onChange={(e) => setCurrentRecipient({...currentRecipient, amount: e.target.value})}
                    placeholder="e.g. 50"
                    type="number"
                    step="any"
                    className="bg-background/50 border-border/30"
                    
                  />
                  {errors.currentAmount && <p className="text-red-500 text-xs mt-1">{errors.currentAmount}</p>}
                </div>

                <Button 
                  onClick={addRecipient}
                  className="w-full"
                  disabled={!chain}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Recipient
                </Button>

                {errors.recipients && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{errors.recipients}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Recipients List */}
            {recipients.length > 0 && (
              <Card className="bg-card/30 w-full border-border/30 max-h-99 overflow-y-scroll">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recipients List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recipientsWithPercentages.map((recipient, index) => (
                      <div key={recipient.id} className="flex items-center justify-between p-3 bg-background/50 rounded-md border border-border/30">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">
                              {index + 1}. {recipient.name}
                            </span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {recipient.percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {recipient.walletAddress.slice(0, 16)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-foreground">
                            {parseFloat(recipient.amount).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRecipient(recipient.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-border/30">
            <Button 
              size="lg" 
              onClick={handleSubmit}
              disabled={ recipients.length < 3 || recipients.length > 50 || !chain || !fromAddress}
              className="flex-1"
            >
              {createLoading ? "Creating..." : "Create Split"}
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => close(false)}
              className="flex-1 border-border/50"
              
            >
              Cancel
            </Button>
          </div>
          {errors.submit && <p className="text-red-500 text-xs mt-1">{errors.submit}</p>}
        </CardContent>
      </Card>
    </div>
  );
}