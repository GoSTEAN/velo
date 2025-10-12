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

const USE_DEMO_DATA = true;

interface ProfileProps {
  user: UserProfile | null;
}

export function BankAccounts({ user }: ProfileProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);
  const { updateProfile } = useAuth();

  const [formData, setFormData] = useState<UserProfile | null>(
    USE_DEMO_DATA ? DEMO_DATA : null
  );

  useEffect(() => {
    if (!USE_DEMO_DATA && user) {
      setFormData(user);
    }
  }, [user]);

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

  const handleAddAccount = async () => {
    const bankDetails = formData?.bankDetails;
    if (!bankDetails?.bankName || !bankDetails?.accountNumber) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);

    try {
      // Call Paystack verification endpoint
      const res = await fetch('/api/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: bankDetails.accountNumber,
          bankCode: bankDetails.bankName,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Verification failed');

      const verifiedName = data.account_name;
      if (!verifiedName) throw new Error('No account name returned.');

      setFormData((prev): UserProfile | null => {
        if (!prev) return prev;
        return {
          ...prev,
          bankDetails: {
            bankName: prev.bankDetails?.bankName ?? '',
            accountNumber: prev.bankDetails?.accountNumber ?? '',
            accountName: verifiedName,
          },
        };
      });

      const userFullName = `${formData?.firstName || ''} ${
        formData?.lastName || ''
      }`.trim();

      // Normalize names for comparison
      const normalize = (name: string) =>
        name.toLowerCase().replace(/\s+/g, ' ').trim();

      const cleanUserName = normalize(userFullName);
      const cleanBankName = normalize(verifiedName);

      if (
        !cleanBankName.includes(cleanUserName) &&
        !cleanUserName.includes(cleanBankName)
      ) {
        toast.error('⚠️ Account name does not match your profile name.');
        setIsLoading(false);
        return;
      }

      const updatedProfile = {
        ...formData,
        bankDetails: {
          bankName: bankDetails.bankName,
          accountNumber: bankDetails.accountNumber,
          accountName: verifiedName,
        },
      };

      const savedUser = await updateProfile(updatedProfile);

      if (savedUser) {
        toast.success('✅ Bank account verified and added successfully.');
        setFormData(savedUser);
        setIsDialogOpen(false);
      } else {
        throw new Error('Failed to save bank account.');
      }
    } catch (error: any) {
      toast.error(`❌ ${error.message || 'Verification failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className='space-y-2'>
                <Label htmlFor='bankName'>Bank Name</Label>
                <div className='relative'>
                  <Building2 className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    id='bankName'
                    value={formData?.bankDetails?.bankName}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          ({
                            ...(prev ?? {}),
                            bankDetails: {
                              ...(prev?.bankDetails ?? {}),
                              bankName: e.target.value,
                            },
                          } as UserProfile)
                      )
                    }
                    className='pl-10'
                    placeholder='Wells Fargo'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='accountNumber'>Account Number</Label>
                <div className='relative'>
                  <Hash className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    id='accountNumber'
                    value={formData?.bankDetails?.accountNumber}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          ({
                            ...(prev ?? {}),
                            bankDetails: {
                              ...(prev?.bankDetails ?? {}),
                              accountNumber: e.target.value,
                            },
                          } as UserProfile)
                      )
                    }
                    className='pl-10'
                    placeholder='1234567890'
                  />
                </div>
              </div>
              {/* <div className='space-y-2'>
                <Label htmlFor='accountName'>Account Name</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    id='accountName'
                    value={formData?.bankDetails?.accountName}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          ({
                            ...(prev ?? {}),
                            bankDetails: {
                              ...(prev?.bankDetails ?? {}),
                              accountName: e.target.value,
                            },
                          } as UserProfile)
                      )
                    }
                    className='pl-10'
                    placeholder='John Doe'
                  />
                </div>
              </div> */}
              <Button
                onClick={handleAddAccount}
                disabled={isLoading}
                className='w-full gap-2'
              >
                {isLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Plus className='w-4 h-4' />
                )}
                Add Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {!formData?.bankDetails ? (
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
