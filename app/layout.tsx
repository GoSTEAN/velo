import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Suspense } from "react";
import { StarknetProvider } from "@/components/providers/starknet-provider";
// import { Roboto } from "next/font/google";
import { AuthProvider } from "@/components/context/AuthContext";
import { Toaster } from 'sonner'

// const roboto = Roboto({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "700"],
//   variable: "--font-roboto",
// });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.connectvelo.com"),
  keywords: [
    "digital wallet",
    "online payments",
    "send money online",
    "money transfer app",
    "instant payments",
    "payment solutions",
    "Nigeria payments",
    "Africa payments",
    "remittance app",
    "cross border payments",
    "multi currency wallet",
    "fiat and crypto",
    "crypto payments",
    "business payments",
    "personal wallet",
    "digital banking",
    "financial app",
    "wallet app",
    "payment app",
    "easy payments",
    "fast transactions",
    "secure payments",
    "global payments",
    "mobile wallet",
    "payment platform",
    "peer to peer payments",
    "buy and sell instantly",
    "crypto wallet",
    "cryptocurrency payments",
    "crypto to cash",
    "crypto to fiat",
    "buy crypto with card",
    "sell crypto for cash",
    "crypto payments simplified",
    "blockchain wallet",
    "crypto assets made easy",
    "DeFi without complexity",
    "crypto on-ramp",
    "crypto off-ramp",
    "convert crypto to fiat",
    "buy digital assets easily",
    "sell crypto instantly",
    "crypto exchange alternative",
    "Starknet wallet",
    "Starknet payments",
    "Starknet crypto app",
  ],
  title: {
    default: "Velo - Your All-in-One Digital Wallet for Fast, Secure Payments",
    template: "%s | Velo",
  },
  openGraph: {
    title: "Velo - Your All-in-One Digital Wallet for Fast, Secure Payments",
    description: "Send money, pay globally, and buy or sell instantly with our secure digital wallet. Simple payments powered by crypto, no technical knowledge needed.",
    url: "https://www.connectvelo.com",
    siteName: "Velo",
    images: [
      {
        url: "/velo-og.png",
        width: 1200,
        height: 630,
        alt: "Velo - Your All-in-One Digital Wallet for Fast, Secure Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ConnectVelo",
    title: "Velo – Simple Payments with Digital Assets",
    description:
      "Send money, pay globally, and buy or sell instantly with our secure digital wallet. Simple payments powered by crypto, no technical knowledge needed.",
    images: ["https://www.connectvelo.com/velo-og.png"],
  },
    robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
              <AuthProvider>
                <ThemeProvider>{children}</ThemeProvider>
                <Toaster richColors position="top-center" />
              </AuthProvider>
          </StarknetProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
