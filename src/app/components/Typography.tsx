"use client";
import React from "react";
import { motion } from "framer-motion";

interface TypographyProps {
  useMotion?: boolean;
  children: React.ReactNode;
  color?: string;
  fontStyle?: "italic" | "not-italic";
  letterCase?: "uppercase" | "lowercase" | "capitalize";
  variant?:
    | "button"
    | "heading"
    | "subheading"
    | "bottomNavText"
    | "body"
    | "caption"
    | "heroSubheading"
    | "navSubheading"
    | "sectionSubheading"
    | "mobileNavSubheading";
  size?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  useMotion,
  variant = "body",
  color,
  letterCase,
  size,
  children,
  fontStyle,
}) => {
  const classNames: { [key: string]: string } = {
    body: "text-black text-base font-serif tracking-wide",
    button: "text-base font-sans-serif font-semibold text-md tracking-wide",
    caption: "text-black text-sm text-gray-500 font-sans-serif tracking-wide",
    heading: "text-3xl md:text-6xl font-bold font-serif leading-relaxed",
    heroSubheading:
      "text-xl md:text-2xl font-thin font-serif tracking-wide leading-relaxed",
    navSubheading:
      "text-sm uppercase font-semibold font-sans-serif tracking-widest",
    mobileNavSubheading: "text-lg uppercase font-sans-serif tracking-widest",
    sectionSubheading:
      "text-black text-2xl font-semibold font-sans-serif tracking-wide",
    subheading:
      "text-black text-xl font-semibold font-sans-serif tracking-wide",
    bottomNavText: "text-black text-lg font-medium font-serif",
  };

  const combinedClasses = `${classNames[variant]} ${fontStyle} ${color} ${letterCase} ${size}`;

  const render = !useMotion ? (
    <span className={combinedClasses}>{children}</span>
  ) : (
    <motion.div
      whileHover={{ color: "#000" }}
      initial={{ opacity: 0, color: "#9ca3af" }}
      animate={{ opacity: 1, color: "#9ca3af" }}
      transition={{ duration: 0.25 }}
      className={combinedClasses}
    >
      {children}
    </motion.div>
  );

  return <>{render}</>;
};
