// components/Typography.tsx
import React from "react";

// Define TypeScript interface for text style variants
interface TypographyProps {
  children: React.ReactNode;
  color?: string;
  letterCase?: "uppercase" | "lowercase" | "capitalize";
  variant?: "heading" | "subheading" | "body" | "caption";
  size?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  color,
  letterCase,
  size,
  children,
}) => {
  const classNames: { [key: string]: string } = {
    heading: "text-4xl font-bold serif tracking-wide",
    subheading: "text-xl font-semibold sans-serif tracking-wide",
    body: "text-base serif tracking-wide",
    caption: "text-sm text-gray-500 sans-serif tracking-wide",
    // Add more variants as needed
  };

  const combinedClasses = `${classNames[variant]} ${color} ${letterCase} ${size}`;
  return <span className={combinedClasses}>{children}</span>;
};
