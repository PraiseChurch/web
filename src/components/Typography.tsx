// components/Typography.tsx
import React from "react";

// Define TypeScript interface for text style variants
interface TypographyProps {
  variant: "heading" | "subheading" | "body" | "caption";
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
}) => {
  const classNames: { [key: string]: string } = {
    heading: "text-4xl font-bold serif",
    subheading: "text-xl font-semibold sans-serif",
    body: "text-base serif",
    caption: "text-sm text-gray-500 sans-serif",
    // Add more variants as needed
  };

  return <span className={classNames[variant]}>{children}</span>;
};
