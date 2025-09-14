"use client";
import Link from "next/link";
import React from "react";


import { motion } from "framer-motion";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  textColor?: string;
}

const NavItem = ({ href, children, onClick, textColor = "text-gray-800" }: NavItemProps) => {
  // Determine hover color based on current text color
  const hoverColor = textColor === "text-white" ? "hover:text-orange-300" : "hover:text-orange-500";
  
  return (
    <Link
      href={href}
      className={`uppercase text-xs font-medium tracking-widest ${textColor} ${hoverColor} transition h-full flex items-center px-2 transition-colors duration-200`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NavItem;
