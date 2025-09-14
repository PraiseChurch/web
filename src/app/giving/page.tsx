import React from "react";
import type { Metadata } from "next";
import { GivingContent } from "./GivingContent";

export const metadata: Metadata = {
  title: "Giving",
  description:
    "Discover the significance of tithing in our community and learn how your contributions support our mission in West Covina and beyond",
};

export default function Giving() {
  return <GivingContent />;
}
