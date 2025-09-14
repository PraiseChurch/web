import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { Merriweather, Inter } from "next/font/google";
import { Navbar } from "./modules";
import { Footer as NewFooter } from "./components/Footer";
import { MobileNavbar } from "./components/MobileNavbar";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SlideProvider } from "../contexts/SlideContext";

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
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
      <body
        className={`${inter.variable} ${merriweather.variable} antialiased`}
      >
        <Analytics />
        <SpeedInsights />
        <SlideProvider>
          <Navbar />
          <MobileNavbar />
          {children}
          <NewFooter />
        </SlideProvider>
      </body>
    </html>
  );
}
