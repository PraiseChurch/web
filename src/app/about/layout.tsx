import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Praise Church West Covina and what we believe in"
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
