"use client";

import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import VerifyForm from "./VerifyForm";
import { Card } from "@/components/ui/Card";

export type AuthTab = "login" | "signup" | "verify";

export interface EncryptedWalletData {
  encryptedMnemonic: string;
  encryptedWallets: {
    ethereum: string;
    bitcoin: string;
    solana: string;
    starknet: string;
  };
  publicAddresses: {
    ethereum: string;
    bitcoin: string;
    solana: string;
    starknet: string;
  };
}

interface AuthPageProps {
  initialTab?: AuthTab;
}

export default function AuthPage({ initialTab = "login" }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [email, setEmail] = useState<string>("");
  const [walletData, setWalletData] = useState<EncryptedWalletData | null>(
    null
  );

  // Enhanced setActiveTab to accept optional email and wallet data
  const handleSetActiveTab = (
    tab: AuthTab,
    emailArg?: string,
    walletDataArg?: EncryptedWalletData
  ) => {
    setActiveTab(tab);
    if (emailArg) setEmail(emailArg);
    if (walletDataArg) setWalletData(walletDataArg);
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 bg-nav flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
            <text
              x="85"
              y="100"
              fontFamily="Arial"
              fontSize="60"
              fontWeight="bold"
              fill="#255ff1"
              textAnchor="middle"
            >
              VELO
            </text>
          </svg>
          <h1 className="text-foreground text-custom-3xl font-bold mb-4">
            Welcome to VELO
          </h1>
          <p className="text-muted-foreground text-custom-lg">
            The fastest way to manage your crypto payments and splits
          </p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8 border-none">
          {activeTab === "login" && (
            <LoginForm setActiveTab={handleSetActiveTab} />
          )}
          {activeTab === "signup" && (
            <SignupForm setActiveTab={handleSetActiveTab} />
          )}
          {activeTab === "verify" && (
            <VerifyForm
              setActiveTab={handleSetActiveTab}
              email={email}
              walletData={walletData}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
