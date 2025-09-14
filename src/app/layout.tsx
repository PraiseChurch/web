import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { Arvo, Inter } from "next/font/google";
import { Navbar } from "./modules";
import { Footer as NewFooter } from "./components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SlideProvider } from "../contexts/SlideContext";
import { MobileBlocker } from "./components/MobileBlocker";

const arvo = Arvo({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-arvo",
  display: "swap",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Praise Church West Covina",
  description: "Southern baptist reformed church in West Covina",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${arvo.variable} antialiased`}>
        <Analytics />
        <SpeedInsights />
        <MobileBlocker>
          <SlideProvider>
            <Navbar />
            {children}
            <NewFooter />
          </SlideProvider>
        </MobileBlocker>
      </body>
    </html>
  );
}
