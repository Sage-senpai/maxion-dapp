// src/app/layout.tsx
// Location: src/app/layout.tsx
// Root layout with Web3 providers and global styles

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/components/shared/Toast';
import { Providers } from "./providers";

// Fonts for MAXION design system
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAXION - Intelligence for Real Yield",
  description: "Intelligence Layer for Real-World Yield on Mantle",
  keywords: ["DeFi", "RWA", "Real World Assets", "Yield", "Mantle", "Web3"],
  authors: [{ name: "MAXION Team" }],
  openGraph: {
    title: "MAXION - Intelligence for Real Yield",
    description: "Intelligence Layer for Real-World Yield on Mantle",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        style={{ backgroundColor: '#0B0E11' }} // MAXION Black
      > 
      <ToastProvider>
        <Providers>
          {children}
        </Providers>
         </ToastProvider>
      </body>
    </html>
  );
}