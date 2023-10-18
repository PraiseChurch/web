import React from "react";

interface TypographyProps {
  children: React.ReactNode;
  color?: string;
  fontStyle?: "italic" | "not-italic";
  letterCase?: "uppercase" | "lowercase" | "capitalize";
  variant?: "button" | "heading" | "subheading" | "body" | "caption" | "heroSubheading" | "navSubheading" | "sectionSubheading" | "mobileNavSubheading";
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
    body: "text-base font-serif tracking-wide",
    button: "text-base font-sans-serif font-semibold text-md tracking-wide",
    caption: "text-sm text-gray-500 font-sans-serif tracking-wide",
    heading: "text-3xl md:text-6xl font-bold font-sans-serif tracking-widest leading-relaxed",
    heroSubheading: "text-xl md:text-2xl font-thin font-serif tracking-wide leading-relaxed",
    navSubheading: "text-xs uppercase font-sans-serif tracking-widest",
    mobileNavSubheading: "text-lg uppercase font-sans-serif tracking-widest",
    sectionSubheading: "text-2xl font-semibold font-sans-serif tracking-wide",
    subheading: "text-xl font-semibold font-sans-serif tracking-wide"
  };

  const combinedClasses = `${classNames[variant]} ${fontStyle} ${color} ${letterCase} ${size}`;
  return <span className={combinedClasses}>{children}</span>;
};
