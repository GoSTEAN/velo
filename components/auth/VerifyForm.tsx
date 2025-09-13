"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthTab } from "./AuthPage";
import { useAuth } from "@/components/context/AuthContext";

interface VerifyFormProps {
  setActiveTab: (tab: AuthTab) => void;
  email?: string;
  onSuccess?: () => void;
}

export default function VerifyForm({ setActiveTab, email = "", onSuccess }: VerifyFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const { verifyOtp, resendOtp } = useAuth();

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const verificationCode = otp.join("");
    
    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      const success = await verifyOtp(email, verificationCode);
      
      if (success) {
        onSuccess?.();
      } else {
        setError("Invalid verification code");
      }
    } catch (err) {
      setError("An error occurred during verification");
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMessage("");
    setError("");

    try {
      const success = await resendOtp(email);
      
      if (success) {
        setResendMessage("Verification code sent successfully");
      } else {
        setError("Failed to resend verification code");
      }
    } catch (err) {
      setError("An error occurred while resending the code");
      console.error("Resend error:", err);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setActiveTab("signup")}
        className="flex items-center text-muted-foreground mb-6 hover:text-foreground"
        disabled={isLoading}
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      <h2 className="text-foreground text-custom-2xl font-bold mb-2">Verify your email</h2>
      <p className="text-muted-foreground text-custom-sm mb-6">
        We've sent a 6-digit code to {email}. Enter it below to continue.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {resendMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {resendMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target as HTMLInputElement, index)}
              onFocus={(e) => e.target.select()}
              className="w-12 h-12 text-center bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground text-custom-xl"
              disabled={isLoading}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-[12px] bg-button text-button font-bold hover:bg-hover duration-200 transition-colors p-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify Account"}
        </button>

        <div className="text-center">
          <p className="text-muted-foreground text-custom-sm">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-[#2F80ED] hover:underline font-medium"
              disabled={isLoading}
            >
              Resend code
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}