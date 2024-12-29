import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { Arvo, Inter, Lato } from "next/font/google";
import { Footer, Navbar } from "./modules";
import { Analytics } from '@vercel/analytics/next';

const arvo = Arvo({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-arvo",
  display: "swap",
});

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
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
    <html
      lang="en"
      className={`${inter.className} ${arvo.variable} ${lato.variable} font-sans`}
    >
      <body>
        <Navbar />
        <div className="flex flex-col w-screen">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
