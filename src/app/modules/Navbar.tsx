"use client";

import NavItem from "@/app/components/NavItem";
import React, { useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSlideContext } from "../../contexts/SlideContext";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentSlideBg } = useSlideContext();
  
  // Get appropriate navbar styles based on current slide
  const getNavbarStyles = (slideBg: string) => {
    switch (slideBg) {
      case "bg-slide-dark":
        return {
          bg: "bg-slide-dark/70",
          border: "border-gray-600/50",
          text: "text-white",
          logo: "/tulip-logo-white.png"
        };
      case "bg-slide-orange":
        return {
          bg: "bg-slide-orange/70",
          border: "border-orange-300/50",
          text: "text-white",
          logo: "/tulip-logo-white.png"
        };
      default:
        return {
          bg: "bg-white/70",
          border: "border-gray-300/50",
          text: "text-gray-900",
          logo: "/tulip-logo-black.png"
        };
    }
  };
  
  const navStyles = getNavbarStyles(currentSlideBg);
  
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
    <nav className={`fixed top-0 left-0 right-0 ${navStyles.bg} backdrop-blur-lg border-b ${navStyles.border} h-16 px-8 flex items-center justify-between z-50 font-sans transition-all duration-500`}>
      <Link href="/">
        <Image
          src={navStyles.logo}
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
          <NavItem key={item.label} href={item.href} textColor={navStyles.text}>
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
        className={`md:hidden p-2 rounded-full border transition relative z-20 ${
          navStyles.text === 'text-white' 
            ? 'border-white/30 bg-white/10 text-white' 
            : 'border-gray-300 bg-white text-gray-800'
        } shadow hover:shadow-lg`}
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
            className={`fixed top-0 right-0 w-72 h-full shadow-xl border-l z-10 flex flex-col pt-24 px-8 transition-colors duration-500 ${
              navStyles.text === 'text-white'
                ? 'bg-slide-dark border-gray-600'
                : 'bg-white border-gray-200'
            }`}
          >
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                textColor={navStyles.text}
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
