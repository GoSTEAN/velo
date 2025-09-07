import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Suspense } from "react";
import { StarknetProvider } from "@/components/providers/starknet-provider";
import { Roboto } from 'next/font/google';


const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Swift",
  description: "Created with Swift",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} `} suppressHydrationWarning>
      <body>
        <Suspense fallback={null}>
          <StarknetProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </StarknetProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
