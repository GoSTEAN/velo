"use client";

import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Recipient, SplitData } from "@/splits";
import Button from "../ui/Button";

interface AddsplitProps {
  close: (value: boolean) => void;
  setSplitData: React.Dispatch<React.SetStateAction<SplitData | null>>;
}

export default function AddSplit({ close, setSplitData }: AddsplitProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  
  // Current recipient being added
  const [currentRecipient, setCurrentRecipient] = useState({
    name: "",
    walletAddress: "",
    amount: ""
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate wallet address format (basic Starknet address validation)
  const isValidWalletAddress = (address: string): boolean => {
    return /^0x[0-9a-fA-F]{64}$/.test(address);
  };

  // Validate amount is a positive number
  const isValidAmount = (amount: string): boolean => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  // Validate all fields
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

    // Validate each recipient
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

  // Validate current recipient
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

  // Add a new recipient
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
      
      // Clear current recipient errors
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors.currentName;
        delete updatedErrors.currentWallet;
        delete updatedErrors.currentAmount;
        return updatedErrors;
      });
    }
  };

  // Remove a recipient
  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(recipient => recipient.id !== id));
  };

  // Calculate percentages based on amounts
  const calculatePercentages = (): Recipient[] => {
    const total = recipients.reduce((sum, recipient) => sum + parseFloat(recipient.amount || "0"), 0);
    
    return recipients.map(recipient => ({
      ...recipient,
      percentage: total > 0 ? Math.round((parseFloat(recipient.amount) / total) * 100) : 0
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      const recipientsWithPercentages = calculatePercentages();
      const totalPercentage = recipientsWithPercentages.reduce((sum, recipient) => sum + (recipient.percentage ?? 0), 0);
      
      if (totalPercentage !== 100) {
        setErrors({...errors, recipients: "Total percentage must equal 100%"});
        return;
      }

      const formData = {
        title,
        description,
        recipients: recipientsWithPercentages
      };
      
      setSplitData(formData);
      alert("Payment split created successfully!");
      close(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    if (field === "title") setTitle(value);
    if (field === "description") setDescription(value);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[field];
        return updatedErrors;
      });
    }
  };

  // Handle current recipient changes
  const handleRecipientChange = (field: keyof typeof currentRecipient, value: string) => {
    setCurrentRecipient(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
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
    <div className="absolute top-25 lg:top-0 left-0 bg-background w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[974.8281860351562px] h-auto p-[32px_22px] gap-[32px] rounded-[12px] bg-Card">
        <h1 className="text-foreground text-custom-md font-bold">
          Create Payment Split
        </h1>
        
        <div className="flex flex-col gap-[24px] lg:flex-row">
          <div className="w-full flex flex-col gap-[10px] p-[8px]">
            <label htmlFor="title" className="text-foreground text-custom-sm">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Input Text"
              className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          
          <div className="w-full flex flex-col gap-[10px] p-[8px]">
            <label htmlFor="des" className="text-foreground text-custom-sm">
              Description
            </label>
            <input
              id="des"
              type="text"
              value={description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Input Text"
              className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
        </div>

        <Card className="flex-col items-start bg-Card mt-5">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-foreground text-custom-md mt-5 font-bold">
              Add Recipients (3-5 required)
            </h1>
            <Button 
              onClick={addRecipient}
              disabled={recipients.length >= 5}
            >
              <Plus />
            </Button>
          </div>

          <div className="flex w-full flex-col gap-[24px] lg:flex-row">
            <div className="w-full flex flex-col gap-[10px] p-[8px]">
              <label htmlFor="name" className="text-foreground text-custom-sm">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={currentRecipient.name}
                onChange={(e) => handleRecipientChange("name", e.target.value)}
                placeholder="Input Text"
                className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
              />
              {errors.currentName && <p className="text-red-500 text-sm">{errors.currentName}</p>}
            </div>
            
            <div className="w-full flex flex-col gap-[10px] p-[8px]">
              <label htmlFor="wallet" className="text-foreground text-custom-sm">
                Wallet Address
              </label>
              <input
                id="wallet"
                type="text"
                value={currentRecipient.walletAddress}
                onChange={(e) => handleRecipientChange("walletAddress", e.target.value)}
                placeholder="0x..."
                className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
              />
              {errors.currentWallet && <p className="text-red-500 text-sm">{errors.currentWallet}</p>}
            </div>
            
            <div className="w-full flex flex-col gap-[10px] p-[8px]">
              <label htmlFor="amount" className="text-foreground text-custom-sm">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                value={currentRecipient.amount}
                onChange={(e) => handleRecipientChange("amount", e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full p-[12px] text-muted-foreground bg-background rounded-[12px] outline-none"
              />
              {errors.currentAmount && <p className="text-red-500 text-sm">{errors.currentAmount}</p>}
            </div>
          </div>

          {errors.recipients && <p className="text-red-500 text-sm mt-2">{errors.recipients}</p>}

          <div className="flex flex-col gap-[12px] mt-3 w-full">
            {recipientsWithPercentages.map((recipient, index) => (
              <div key={recipient.id} className="w-full flex-col flex gap-[12px]">
                <h4 className="text-custom-xs text-muted-foreground">
                  Recipient {index + 1}
                </h4>
                <Card className="justify-between bg-background border-none w-full p-2 flex items-center">
                  <p className="text-foreground text-custom-md">
                    {recipient.name}
                  </p>
                  <div className="w-fit flex items-center gap-[8px]">
                    <div className="border-[#27AE60] px-1 rounded-[4px] text-[#27AE60] border">
                      {recipient.percentage}%
                    </div>
                    <button 
                      className="cursor-pointer"
                      onClick={() => removeRecipient(recipient.id)}
                    >
                      <Trash2
                        size={16}
                        className="text-muted-foreground hover:text-red-500"
                      />
                    </button>
                  </div>
                </Card>
                
                {/* Individual recipient errors */}
                {errors[`recipient-${index}-name`] && (
                  <p className="text-red-500 text-sm">{errors[`recipient-${index}-name`]}</p>
                )}
                {errors[`recipient-${index}-wallet`] && (
                  <p className="text-red-500 text-sm">{errors[`recipient-${index}-wallet`]}</p>
                )}
                {errors[`recipient-${index}-amount`] && (
                  <p className="text-red-500 text-sm">{errors[`recipient-${index}-amount`]}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="w-full flex gap-[24px] flex-col mt-5 lg:flex-row">
          <Button 
          size="lg"
            onClick={handleSubmit}
          >
            Create Split
          </Button>
          <Button
          size="lg"
          variant="secondary"
            onClick={() => close(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}