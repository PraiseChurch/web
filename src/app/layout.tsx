import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { Arvo, Inter } from "next/font/google";
import { Navbar } from "./modules";
import { Footer as NewFooter } from "./components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SlideProvider } from "../contexts/SlideContext";

const arvo = Arvo({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-arvo",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="font-sans">
      <body>
        <SlideProvider>
          <Navbar />
          <div className="flex flex-col w-screen">{children}</div>
          <NewFooter />
        </SlideProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
