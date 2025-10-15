'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Plus,
  Building2,
  Hash,
  User,
  Loader2,
  Copy,
  Check,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/cards';
import { Button } from '../ui/buttons';
import { UserProfile } from '@/types/authContext';
import { useAuth } from '../context/AuthContext';

export const DEMO_DATA: UserProfile = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '1234567890',
  isEmailVerified: true,
  kyc: null,
  kycStatus: 'pending',
  createdAt: new Date().toISOString(),
  username: 'johndoe',
  displayPicture: null,
  bankDetails: {
    bankName: 'Access Bank',
    accountNumber: '1234567890',
    accountName: 'John Doe',
  },
};

const USE_DEMO_DATA = false;

interface ProfileProps {
  user: UserProfile | null;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  slug: string;
}

interface VerificationResult {
  account_number: string;
  account_name: string;
  bank_id: number;
  bank_name: string;
}

export function BankAccounts({ user }: ProfileProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);
  const { updateProfile } = useAuth();

  const [formData, setFormData] = useState<UserProfile | null>(user);

  useEffect(() => {
  console.log("Current formData:", formData);
  console.log("Current user prop:", user);
}, [formData, user]);

  // Bank verification states
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if ( user) {
      setFormData(user);
    }
  }, [user]);

  // Fetch banks from Paystack API
  const fetchBanks = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://api.paystack.co/bank", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch banks");
      }

      const data = await response.json();

      if (data.status) {
        // Sort banks alphabetically
        const sortedBanks = data.data.sort((a: Bank, b: Bank) =>
          a.name.localeCompare(b.name)
        );
        setBanks(sortedBanks);
        setFilteredBanks(sortedBanks);
      } else {
        throw new Error(data.message || "Unable to load banks");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter banks based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = banks.filter(
        (bank) =>
          bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bank.code.includes(searchQuery)
      );
      setFilteredBanks(filtered);
    } else {
      setFilteredBanks(banks);
    }
  }, [searchQuery, banks]);

  // Verify account number
  const verifyAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10) return;

    setIsVerifying(true);
    setError("");
    setVerificationResult(null);

    try {
      const response = await fetch("/api/verify-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNumber: accountNumber.replace(/\s/g, ""),
          bankCode: selectedBank.code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationResult({
          ...data,
          bank_name: selectedBank.name
        });
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during verification"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Format account number with spaces for readability
  const formatAccountNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  // Select a bank
  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  // Handle account number change with auto-verification
  const handleAccountNumberChange = (value: string) => {
    const cleanedValue = value.replace(/\s/g, "");
    setAccountNumber(cleanedValue);

    // Auto-verify when account number reaches 10 digits
    if (cleanedValue.length === 10 && selectedBank) {
      verifyAccount();
    }
  };

// Add verified bank account
const handleAddBank = async () => {
  if (!verificationResult || !selectedBank) {
    toast.error('Please verify your bank account first.');
    return;
  }

  setIsLoading(true);

  try {
    const userFullName = `${formData?.firstName || ''} ${
      formData?.lastName || ''
    }`.trim();

    // Normalize names for comparison
    const normalize = (name: string) =>
      name.toLowerCase().replace(/\s+/g, ' ').trim();

    const cleanUserName = normalize(userFullName);
    const cleanBankName = normalize(verificationResult.account_name);

    // Name matching logic
    // if (
    //   userFullName &&
    //   !cleanBankName.includes(cleanUserName) &&
    //   !cleanUserName.includes(cleanBankName)
    // ) {
    //   toast.error('⚠️ Account name does not match your profile name.');
    //   setIsLoading(false);
    //   return;
    // }

    // Create the updated profile with proper bank details
    const updatedProfile = {
      ...formData,
      bankDetails: {
        bankName: selectedBank.name,
        accountNumber: verificationResult.account_number,
        accountName: verificationResult.account_name,
      },
    };

    console.log("Updating profile with:", updatedProfile);

    const savedUser = await updateProfile(updatedProfile);
    
    console.log("Saved user response:", savedUser);
    
    if (savedUser) {
      toast.success('✅ Bank account verified and added successfully.');
      setFormData(savedUser);
      setIsDialogOpen(false);
      resetVerificationState();
    } else {
      throw new Error('Failed to save bank account.');
    }
  } catch (error: any) {
    console.error("Error adding bank:", error);
    toast.error(` ${error.message || 'Failed to add bank account'}`);
  } finally {
    setIsLoading(false);
  }
};

  // Reset verification state
  const resetVerificationState = () => {
    setSelectedBank(null);
    setAccountNumber("");
    setVerificationResult(null);
    setError("");
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      resetVerificationState();
    }
  }, [isDialogOpen]);

  // Fetch banks when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchBanks();
    }
  }, [isDialogOpen]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccountNumber(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedAccountNumber(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Check if account number has exactly 10 digits
  const hasValidAccountNumber = accountNumber.length === 10;

  // Check if verify button should be enabled
  const isVerifyButtonEnabled =
    selectedBank && hasValidAccountNumber && !isVerifying && !verificationResult;

  return (
    <Card className='transition-smooth hover:shadow-md'>
      <CardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pb-6'>
        <div className='flex items-center gap-2'>
          <CreditCard className='w-5 h-5 text-primary' />
          <CardTitle className='text-lg sm:text-xl'>Bank Accounts</CardTitle>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='gap-2 bg-transparent w-full sm:w-auto'
            >
              <Plus className='w-4 h-4' />
              Add Bank
            </Button>
          </DialogTrigger>
          <DialogContent className='w-[95vw] max-w-md mx-auto bg-sidebar backdrop-blur-lg border border-border/50 shadow-lg'>
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              {/* Bank Selection */}
              <div className='space-y-2'>
                <Label htmlFor='bank'>Select Bank</Label>
                <div className='relative'>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 text-left bg-background border border-border rounded-lg outline-none"
                    disabled={isLoading}
                  >
                    <span className={selectedBank ? "text-foreground" : "text-muted-foreground"}>
                      {selectedBank ? selectedBank.name : "Select your bank"}
                    </span>
                    <ChevronDown
                      size={20}
                      className={cn(
                        "text-muted-foreground transition-transform",
                        isDropdownOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {/* Search input */}
                      <div className="sticky top-0 bg-background p-2 border-b border-border">
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            size={16}
                          />
                          <input
                            type="text"
                            placeholder="Search banks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background outline-none text-foreground border-none"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Bank list */}
                      <div className="py-1">
                        {filteredBanks.length > 0 ? (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => handleBankSelect(bank)}
                              className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-accent"
                            >
                              <span className="text-foreground">{bank.name}</span>
                              {selectedBank?.id === bank.id && (
                                <Check size={16} className="text-primary" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-muted-foreground">
                            No banks found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Number Input */}
              <div className='space-y-2'>
                <Label htmlFor='accountNumber'>Account Number</Label>
                <div className='relative'>
                  <Hash className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    id='accountNumber'
                    value={formatAccountNumber(accountNumber)}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    className='pl-10'
                    placeholder='1234 5678 90'
                    maxLength={14}
                    disabled={!selectedBank || isLoading}
                  />
                </div>
                {accountNumber.length > 0 && accountNumber.length < 10 && (
                  <p className="text-xs text-muted-foreground">
                    Enter 10 digits to verify
                  </p>
                )}
                {hasValidAccountNumber && (
                  <p className="text-xs text-green-600">
                    ✓ 10 digits entered - ready to verify
                  </p>
                )}
              </div>

              {/* Manual Verify Button */}
              {hasValidAccountNumber && !verificationResult && (
                <Button
                  onClick={verifyAccount}
                  disabled={!isVerifyButtonEnabled}
                  className="w-full gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      Verifying...
                    </>
                  ) : (
                    'Verify Account'
                  )}
                </Button>
              )}

              {/* Add Bank Button */}
              {verificationResult && (
                <Button
                  onClick={handleAddBank}
                  disabled={isLoading}
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <Plus className='w-4 h-4' />
                  )}
                  Add Bank Account
                </Button>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  <div className="flex items-center">
                    <X className="h-4 w-4 text-red-400 mr-2" />
                    <span className="font-medium">Error: {error}</span>
                  </div>
                </div>
              )}

              {/* Verification Result */}
              {verificationResult && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                  <div className="flex items-center mb-2">
                    <Check className="h-4 w-4 text-green-400 mr-2" />
                    <span className="font-medium">Verification Successful</span>
                  </div>
                  <div className="mt-1">
                    <p>
                      <span className="font-semibold">Account Name:</span>{" "}
                      {verificationResult.account_name}
                    </p>
                    <p>
                      <span className="font-semibold">Account Number:</span>{" "}
                      {verificationResult.account_number}
                    </p>
                    <p>
                      <span className="font-semibold">Bank:</span>{" "}
                      {selectedBank?.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {!formData?.bankDetails?.accountNumber || !formData?.bankDetails?.bankName ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='text-center py-12'
            >
              <CreditCard className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-medium text-muted-foreground mb-2'>
                No bank accounts linked
              </h3>
              <p className='text-sm text-muted-foreground'>
                Add a bank account to get started
              </p>
            </motion.div>
          ) : (
            <div className='space-y-4'>
              <motion.div
                key={user?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='p-4 border rounded-lg bg-card hover:bg-accent/5 transition-smooth'
              >
                <div className='space-y-4'>
                  {/* Bank Name Section */}
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
                      <Building2 className='w-5 h-5 text-primary' />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Bank Name</p>
                      <p className='font-semibold text-foreground'>
                        {formData.bankDetails.bankName}
                      </p>
                    </div>
                  </div>

                  {/* Account Number Section with Copy */}
                  <div className='flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 border border-border/80'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <Hash className='w-4 h-4 text-muted-foreground flex-shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-muted-foreground mb-0.5'>
                          Account Number
                        </p>
                        <p className='font-mono text-sm font-medium text-foreground truncate'>
                          {formData.bankDetails.accountNumber}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        copyToClipboard(
                          formData?.bankDetails?.accountNumber ?? ''
                        )
                      }
                      className='flex-shrink-0 h-8 w-8 p-0'
                    >
                      {copiedAccountNumber ? (
                        <Check className='w-4 h-4 text-success' />
                      ) : (
                        <Copy className='w-4 h-4' />
                      )}
                    </Button>
                  </div>

                  {/* Account Name Section */}
                  <div className='flex items-center gap-3'>
                    <User className='w-4 h-4 text-muted-foreground' />
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Account Name
                      </p>
                      <p className='text-sm text-foreground'>
                        {formData.bankDetails.accountName}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Add the missing cn utility function
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}