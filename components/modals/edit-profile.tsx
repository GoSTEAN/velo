"use client";

import { RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../ui/buttons";
import { ProfileForm } from "../profile/profile-form";
import { motion } from "framer-motion";
import { ProfileAvatar } from "../profile/profile-avatar";
import { BankAccounts } from "../profile/bank-accounts";
import { IdentityVerification } from "../profile/identity-verification";

export default function ProfileSettingsPage() {
  const { user} = useAuth();
 
 
  return (
    <div className="min-h-screen bg-background mb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">Profile Settings</h1>
              <p className="text-muted-foreground text-pretty text-sm sm:text-base">
                Manage your profile information and preferences
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent self-start sm:self-auto">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <ProfileAvatar user={user || null} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <ProfileForm />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <BankAccounts user={user} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <IdentityVerification kycStatus={user?.kycStatus} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}