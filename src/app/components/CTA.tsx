"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface CTAProps {
  href: string;
  children: React.ReactNode;
  leadingDecorator?: React.ReactNode;
  trailingDecorator?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
}

export const CTA: React.FC<CTAProps> = ({
  href,
  children,
  leadingDecorator,
  trailingDecorator,
  className = "",
  variant = "ghost",
  size = "sm",
  onClick,
  target,
  rel
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "text-orange-600 hover:text-orange-800 font-medium";
      case "secondary":
        return "text-gray-700 hover:text-gray-900 font-medium";
      case "ghost":
      default:
        return "text-orange-700 hover:text-orange-900 font-medium";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "lg":
        return "text-base gap-3";
      case "md":
        return "text-sm gap-2";
      case "sm":
      default:
        return "text-sm gap-2";
    }
  };

  const Component = motion.a;

  return (
    <Component
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      className={`
        inline-flex items-center transition-colors duration-200
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      whileHover={{ x: 2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {leadingDecorator && (
        <motion.span 
          className="flex-shrink-0"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {leadingDecorator}
        </motion.span>
      )}
      
      <span className="flex-1">{children}</span>
      
      {trailingDecorator && (
        <motion.span 
          className="flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {trailingDecorator}
        </motion.span>
      )}
    </Component>
  );
};
