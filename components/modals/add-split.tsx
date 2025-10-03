"use client";

import { Plus, Trash2, Users } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cards";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Recipient, SplitData } from "@/splits";

interface AddsplitProps {
  close: (value: boolean) => void;
  setSplitData: React.Dispatch<React.SetStateAction<SplitData | null>>;
}

export default function AddSplit({ close, setSplitData }: AddsplitProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  
  const [currentRecipient, setCurrentRecipient] = useState({
    name: "",
    walletAddress: "",
    amount: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValidWalletAddress = (address: string): boolean => {
    return /^0x[0-9a-fA-F]{64}$/.test(address);
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

    if (recipients.length < 3) {
      newErrors.recipients = "At least 3 recipients are required";
    } else if (recipients.length > 5) {
      newErrors.recipients = "Maximum 5 recipients allowed";
    }

    recipients.forEach((recipient, index) => {
      if (!recipient.name.trim()) {
        newErrors[`recipient-${index}-name`] = "Name is required";
      }
      
      if (!isValidWalletAddress(recipient.walletAddress)) {
        newErrors[`recipient-${index}-wallet`] = "Invalid wallet address";
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
    
    if (!isValidWalletAddress(currentRecipient.walletAddress)) {
      newErrors.currentWallet = "Invalid wallet address";
    }
    
    if (!isValidAmount(currentRecipient.amount)) {
      newErrors.currentAmount = "Amount must be a positive number";
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const addRecipient = () => {
    if (recipients.length >= 5) {
      setErrors({...errors, recipients: "Maximum 5 recipients allowed"});
      return;
    }

    if (validateCurrentRecipient()) {
      const newRecipient: Recipient = {
        id: Date.now().toString(),
        name: currentRecipient.name,
        walletAddress: currentRecipient.walletAddress,
        amount: currentRecipient.amount
      };
      
      setRecipients([...recipients, newRecipient]);
      setCurrentRecipient({ name: "", walletAddress: "", amount: "" });
      
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors.currentName;
        delete updatedErrors.currentWallet;
        delete updatedErrors.currentAmount;
        return updatedErrors;
      });
    }
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  const calculatePercentages = (): Recipient[] => {
    const total = recipients.reduce((sum, recipient) => sum + parseFloat(recipient.amount || "0"), 0);
    
    return recipients.map(recipient => ({
      ...recipient,
      percentage: total > 0 ? Math.round((parseFloat(recipient.amount) / total) * 100) : 0
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const recipientsWithPercentages = calculatePercentages();
      const totalPercentage = recipientsWithPercentages.reduce((sum, recipient) => sum + (recipient.percentage ?? 0), 0);
      
      if (totalPercentage !== 100) {
        setErrors({...errors, recipients: "Total percentage must equal 100%"});
        return;
      }

      const formData: SplitData = {
        title,
        description,
        recipients: recipientsWithPercentages
      };
      
      setSplitData(formData);
      alert("Payment split created successfully!");
      close(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "title") setTitle(value);
    if (field === "description") setDescription(value);
    
    if (errors[field]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[field];
        return updatedErrors;
      });
    }
  };

  const handleRecipientChange = (field: keyof typeof currentRecipient, value: string) => {
    setCurrentRecipient(prev => ({ ...prev, [field]: value }));
    
    const errorKey = `current${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[errorKey];
        return updatedErrors;
      });
    }
  };

  const recipientsWithPercentages = calculatePercentages();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="sticky top-0 pt-5 bg-card/80 backdrop-blur-sm z-10 border-b border-border/30">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            Create Payment Split
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium text-foreground">Title</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter split title"
                  className="mt-1 border-border/50"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium text-foreground">Description</label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter description"
                  className="mt-1 border-border/50"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Current Stats */}
            <Card className="p-4 bg-accent/20 border-border/30">
              <h3 className="text-sm font-medium text-foreground mb-3">Split Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recipients:</span>
                  <span className="text-sm font-medium text-foreground">{recipients.length}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Percentage:</span>
                  <span className="text-sm font-medium text-foreground">
                    {recipientsWithPercentages.reduce((sum, r) => sum + (r.percentage || 0), 0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`text-sm font-medium ${
                    recipients.length >= 3 && recipients.length <= 5 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {recipients.length >= 3 && recipients.length <= 5 ? 'Ready' : 'Incomplete'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Add Recipient */}
          <Card className="bg-card/30 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Add Recipients (3-5 required)</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addRecipient}
                disabled={recipients.length >= 5}
                className="flex items-center gap-2 border-border/50"
              >
                <Plus className="h-4 w-4" />
                Add Recipient
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                  <Input
                    id="name"
                    value={currentRecipient.name}
                    onChange={(e) => handleRecipientChange("name", e.target.value)}
                    placeholder="Enter name"
                    className="mt-1 border-border/50"
                  />
                  {errors.currentName && <p className="text-red-500 text-sm mt-1">{errors.currentName}</p>}
                </div>
                <div>
                  <label htmlFor="wallet" className="text-sm font-medium text-foreground">Wallet Address</label>
                  <Input
                    id="wallet"
                    value={currentRecipient.walletAddress}
                    onChange={(e) => handleRecipientChange("walletAddress", e.target.value)}
                    placeholder="0x..."
                    className="mt-1 border-border/50 font-mono text-sm"
                  />
                  {errors.currentWallet && <p className="text-red-500 text-sm mt-1">{errors.currentWallet}</p>}
                </div>
                <div>
                  <label htmlFor="amount" className="text-sm font-medium text-foreground">Amount</label>
                  <Input
                    id="amount"
                    type="number"
                    value={currentRecipient.amount}
                    onChange={(e) => handleRecipientChange("amount", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="mt-1 border-border/50"
                  />
                  {errors.currentAmount && <p className="text-red-500 text-sm mt-1">{errors.currentAmount}</p>}
                </div>
              </div>
              {errors.recipients && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{errors.recipients}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Recipients List */}
          {recipients.length > 0 && (
            <Card className="bg-card/30 border-border/30">
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

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-border/30">
            <Button 
              size="lg" 
              onClick={handleSubmit}
              disabled={recipients.length < 3 || recipients.length > 5}
              className="flex-1"
            >
              Create Split
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
        </CardContent>
      </Card>
    </div>
  );
}