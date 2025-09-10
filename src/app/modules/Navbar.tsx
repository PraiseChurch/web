"use client";

import NavItem from "@/app/components/NavItem";
import React, { useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Stream", href: "/stream" },
    { label: "Visit", href: "/visit" },
    { label: "Giving", href: "/giving" },
  ];
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!navRef.current) return;
    const navLinks = Array.from(navRef.current.querySelectorAll("a"));
    const activeIdx = navItems.findIndex((item) => item.href === pathname);
    if (activeIdx === -1) {
      setUnderline({ left: 0, width: 0 });
      return;
    }
    const activeLink = navLinks[activeIdx] as HTMLElement;
    if (activeLink) {
      setUnderline({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      });
    }
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 px-8 flex items-center justify-between z-50 font-sans">
      <Link href="/">
        <Image
          src="/tulip-logo-black.png"
          alt="Praise Church West Covina logo"
          width={32}
          height={32}
          priority
        />
      </Link>
      <div
        key={pathname}
        className="hidden md:flex gap-8 items-end w-auto relative h-full"
        ref={navRef}
      >
        {navItems.map((item) => (
          <NavItem key={item.label} href={item.href}>
            {item.label}
          </NavItem>
        ))}
        {/* Animated underline */}
        <motion.div
          layout
          className="absolute bottom-0 h-[2px] bg-orange-500"
          initial={false}
          animate={{ left: underline.left, width: underline.width }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setMenuOpen((o) => !o)}
        className="md:hidden p-2 rounded-full border border-gray-300 bg-white shadow hover:shadow-lg transition relative z-20"
        aria-label="Toggle menu"
      >
        <motion.div
          animate={{ rotate: menuOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="block"
          >
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-72 h-full bg-white shadow-xl border-l border-gray-200 z-10 flex flex-col pt-24 px-8"
          >
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavItem>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
