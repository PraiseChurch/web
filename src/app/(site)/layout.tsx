import React from "react";
import { Navbar } from "../modules";
import { Footer as NewFooter } from "../components/Footer";
import { MobileNavbar } from "../components/MobileNavbar";
import { SlideProvider } from "../../contexts/SlideContext";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SlideProvider>
      <Navbar />
      <MobileNavbar />
      {children}
      <NewFooter />
    </SlideProvider>
  );
}
