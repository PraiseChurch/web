"use client";
import Link from "next/link";
import React from "react";


import { motion } from "framer-motion";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}

const NavItem = ({ href, children, onClick }: NavItemProps) => (
  <Link
    href={href}
    className="uppercase text-xs font-medium tracking-widest text-gray-800 hover:text-orange-500 transition h-full flex items-center px-2 transition-colors duration-200"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default NavItem;
