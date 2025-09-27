"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { CreditCard, Plus, Building2, Hash, User, Loader2 } from "lucide-react"
import { useAuth, UserProfile } from "../context/AuthContext"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/cards"

import { Button } from "../ui/buttons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

interface ProfileProps {
  user: UserProfile | null
}


export function BankAccounts({ user }: ProfileProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { isLoading } = useAuth()

  const [formData, setFormData] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      setFormData(user)
    }
  }, [user])


  const handleAddAccount = async () => {
    if (!formData?.bankDetails?.accountName || !formData.bankDetails.accountNumber || !formData.bankDetails.bankName) {
      toast.error('Please fill in all fields.')
      return
    }

    try {
      // const onSuccess = await addBankAccount(formData)
      const onSuccess = false;
      if (onSuccess) {
        setIsDialogOpen(false)
        toast.success('Bank account added', {
          description: "Your bank account has been added successfully."
        })
        setFormData(user)
      }
    } catch (error: string | any) {
      toast.error('Failed to add bank account', {
        description: `Please try again. Error: ${error.message || error}`
      })
    }
  }

  const handleVerifyAccount = async (accountId: string) => {
    try {
      // await verifyBankAccount(accountId)
      toast.success('Account verified', {
        description: "Your bank account has been verified successfully."
      })
    } catch (error: string | any) {
      toast.error('Failed to verify account', {
        description: `Please try again. Error: ${error.message || error}`
      })
    }
  }

  return (
    <Card className="transition-smooth hover:shadow-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg sm:text-xl">Bank Accounts</CardTitle>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Bank
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto bg-white">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="bankName"
                    value={formData?.bankDetails?.bankName}
                    onChange={(e) => setFormData((prev) => ({ ...(prev ?? {}), bankName: e.target.value } as UserProfile))}
                    className="pl-10"
                    placeholder="Wells Fargo"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="accountNumber"
                    value={formData?.bankDetails?.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value } as UserProfile)}
                    className="pl-10"
                    placeholder="1234567890"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="accountName"
                    value={formData?.bankDetails?.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value } as UserProfile)}
                    className="pl-10"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <Button onClick={handleAddAccount} disabled={isLoading} className="w-full gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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
              className="text-center py-12"
            >
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No bank accounts linked</h3>
              <p className="text-sm text-muted-foreground">Add a bank account to get started</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div
                key={user?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-smooth"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Building2 className="w-5 h-5 text-primary" />
                      <span className="font-medium">{formData.bankDetails.bankName}</span>
                      {/* {account.isVerified ? (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )} */}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Hash className="w-3 h-3" />
                        <span>
                          ****{formData?.bankDetails?.accountNumber
                            ? formData.bankDetails.accountNumber.slice(-4)
                            : "----"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{formData.bankDetails.accountName}</span>
                      </div>
                    </div>
                  </div>
                  {/* {!account.isVerified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyAccount(account.id)}
                        disabled={isLoading}
                        className="gap-2 w-full sm:w-auto"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        <span className="hidden sm:inline">Verify Bank</span>
                        <span className="sm:hidden">Verify</span>
                      </Button>
                    )} */}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
