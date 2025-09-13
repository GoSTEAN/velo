"use client";

import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import VerifyForm from "./VerifyForm";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { useRouter } from "next/navigation";

export type AuthTab = "login" | "signup" | "verify";

interface AuthPageProps {
  initialTab?: AuthTab;
}

export default function AuthPage({ initialTab = "login" }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [emailForVerification, setEmailForVerification] = useState("");
  const router = useRouter();

  const handleSignupSuccess = (email: string) => {
    setEmailForVerification(email);
    setActiveTab("verify");
  };

  const handleAuthSuccess = () => {
    // Redirect to dashboard or home page after successful authentication
    router.push("/dashboard");
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 bg-nav flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Image
            src="/swiftLogo.svg"
            alt="Swift Logo"
            width={180}
            height={60}
            className="mb-8"
          />
          <h1 className="text-foreground text-custom-3xl font-bold mb-4">
            Welcome to Swift
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
            <LoginForm 
              setActiveTab={setActiveTab} 
              onSuccess={handleAuthSuccess}
            />
          )}
          {activeTab === "signup" && (
            <SignupForm 
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "verify" && (
            <VerifyForm 
              setActiveTab={setActiveTab}
              email={emailForVerification}
              onSuccess={handleAuthSuccess}
            />
          )}
        </Card>
      </div>
    </div>
  );
}