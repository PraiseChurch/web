import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visit",
  description: "Visit our vibrant Christian community here at Praise Church West Covina and learn about what a typical service is like"
}

export default function VisitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
