import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Suspense } from "react";
import { StarknetProvider } from "@/components/providers/starknet-provider";
// import { Roboto } from "next/font/google";
import { AuthProvider } from "@/components/context/AuthContext";
import { NetworkProvider } from "@/components/context/NetworkContext";
import { Toaster} from 'sonner'

// const roboto = Roboto({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "700"],
//   variable: "--font-roboto",
// });

export const metadata: Metadata = {
  title: "VELO",
  description: "Created with VELO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`$ `} suppressHydrationWarning>
      <body>
        <Suspense fallback={null}>
          <StarknetProvider>
             <NetworkProvider>
            <AuthProvider>
              <ThemeProvider>{children}</ThemeProvider>
            <Toaster richColors  position="top-center" />
            </AuthProvider>
            </NetworkProvider>
          </StarknetProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
