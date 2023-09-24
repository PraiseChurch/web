// components/Typography.tsx
import React from "react";

// Define TypeScript interface for text style variants
interface TypographyProps {
  children: React.ReactNode;
  color?: string;
  fontStyle?: "italic" | "not-italic";
  letterCase?: "uppercase" | "lowercase" | "capitalize";
  variant?: "heading" | "subheading" | "body" | "caption" | "heroSubheading";
  size?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  color,
  letterCase,
  size,
  children,
  fontStyle
}) => {
  const classNames: { [key: string]: string } = {
    body: "text-base serif tracking-wide",
    caption: "text-sm text-gray-500 sans-serif tracking-wide",
    heading: "text-3xl md:text-6xl font-bold serif tracking-widest leading-relaxed",
    heroSubheading: "text-xl md:text-2xl sans-serif tracking-wide leading-relaxed",
    subheading: "text-xl font-semibold sans-serif tracking-wide",
    // Add more variants as needed
  };

  const combinedClasses = `${classNames[variant]} ${fontStyle} ${color} ${letterCase} ${size}`;
  return <span className={combinedClasses}>{children}</span>;
};
