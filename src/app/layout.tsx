import "./globals.css";
import type { Metadata } from "next";
import { Arvo, Inter, Lato } from "next/font/google";
import { Footer, Navbar } from "./modules";

const arvo = Arvo({
  weight: "400",
  subsets: ["latin"],
});
const lato = Lato({
  weight: "300",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${inter.className} ${arvo.className} ${lato.className} font-sans-serif font-serif`}
      >
        <Navbar />
        <div className="flex flex-col w-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
