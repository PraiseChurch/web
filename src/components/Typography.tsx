// components/Typography.tsx
import React from "react";

// Define TypeScript interface for text style variants
interface TypographyProps {
  variant: "heading" | "subheading" | "body" | "caption";
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({ variant, children }) => {
  const classNames: { [key: string]: string } = {
    heading: "text-4xl font-bold",
    subheading: "text-xl font-semibold",
    body: "text-base",
    caption: "text-sm text-gray-500",
    // Add more variants as needed
  };

  return <span className={classNames[variant]}>{children}</span>;
};

export default Typography;
