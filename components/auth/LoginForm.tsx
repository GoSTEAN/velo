"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { AuthTab } from "./AuthPage";

interface LoginFormProps {
  setActiveTab: (tab: AuthTab) => void;
}

export default function LoginForm({ setActiveTab }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic would go here
    console.log("Login attempt:", formData);
  };

  return (
    <div className="w-full">
      <h2 className="text-foreground text-custom-2xl font-bold mb-6">Login to your account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-foreground text-custom-sm">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-foreground text-custom-sm">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-[7px] outline-none focus:border-[#2F80ED] text-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 text-[#2F80ED] bg-background border-border rounded focus:ring-[#2F80ED]"
            />
            <label htmlFor="remember" className="text-muted-foreground text-custom-sm">
              Remember me
            </label>
          </div>

          <button type="button" className="text-[#2F80ED] text-custom-sm hover:underline">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-[12px] bg-button text-button font-bold hover:bg-hover duration-200 transition-colors p-4"
        >
          Login
        </button>

        <div className="text-center">
          <p className="text-muted-foreground text-custom-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className="text-[#2F80ED] hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}