"use client";
import React from "react";
import { StarknetProvider } from "./starknet-provider";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/components/context/AuthContext";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <StarknetProvider>
      <SessionProvider>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </SessionProvider>
    </StarknetProvider>
  );
}
