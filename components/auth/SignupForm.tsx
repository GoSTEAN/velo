"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { AuthTab } from "./AuthPage";
import { useAuth } from "@/components/context/AuthContext";

interface SignupFormProps {
  setActiveTab: (tab: AuthTab) => void;
}

export default function SignupForm({ setActiveTab }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(formData.email, formData.password);
      
      if (success) {
        setActiveTab("verify");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during registration");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-foreground text-custom-2xl font-bold mb-6">Create an account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className="text-foreground text-custom-sm">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First name"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="lastName" className="text-foreground text-custom-sm">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last name"
              className="w-full px-4 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="signup-email" className="text-foreground text-custom-sm">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              id="signup-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="signup-password" className="text-foreground text-custom-sm">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Create a password"
              className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-foreground text-custom-sm">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
            className="w-4 h-4 text-[#2F80ED] bg-background border-border rounded focus:ring-[#2F80ED]"
            required
            disabled={isLoading}
          />
          <label htmlFor="agreeToTerms" className="text-muted-foreground text-custom-sm">
            I agree to the Terms and Conditions
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.agreeToTerms}
          className="w-full rounded-[12px] bg-button text-button font-bold hover:bg-hover duration-200 transition-colors p-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="text-center">
          <p className="text-muted-foreground text-custom-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className="text-[#2F80ED] hover:underline font-medium"
              disabled={isLoading}
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}