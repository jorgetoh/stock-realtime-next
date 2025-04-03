import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";

import { Header } from "@/components/header";
import type { ReactNode } from "react";
import { Providers } from "../providers";
import { CommandMenu } from "@/components/dashboard/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Simulator | jorgetoh.me",
  description:
    "Bitcoin trading simulator application that allows users to practice trading with real-time market data.",
  openGraph: {
    title: "Trading Simulator | jorgetoh.me",
    description:
      "Bitcoin trading simulator application that allows users to practice trading with real-time market data.",
    images: [
      {
        url: "https://trade.jorgetoh.me/preview.webp",
        width: 1200,
        height: 630,
        alt: "Trading Simulator Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Simulator | jorgetoh.me",
    description:
      "Bitcoin trading simulator application that allows users to practice trading with real-time market data.",
    images: ["https://trade.jorgetoh.me/preview.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <CommandMenu />
        </Providers>
      </body>
    </html>
  );
}
