"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSlideContext } from "../../contexts/SlideContext";
import { Separator } from "./Separator";

export const MobileNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentSlideBg, setCurrentSlide } = useSlideContext();
  const pathname = usePathname();

  // Get appropriate navbar styles based on current slide
  const getNavbarStyles = (slideBg: string) => {
    switch (slideBg) {
      case "bg-slide-dark":
        return {
          bg: "bg-slide-dark",
          border: "border-gray-600/50",
          text: "text-white",
          logo: "/tulip-logo-white.png",
        };
      case "bg-slide-orange":
        return {
          bg: "bg-slide-orange",
          border: "border-orange-300/50",
          text: "text-white",
          logo: "/tulip-logo-white.png",
        };
      default:
        return {
          bg: "bg-white/70",
          border: "border-gray-300/50",
          text: "text-gray-900",
          logo: "/tulip-logo-black.png",
        };
    }
  };

  const navStyles = getNavbarStyles(currentSlideBg);

  const navigateToFirstSlide = () => {
    if (pathname !== '/') {
      // If not on homepage, navigate there first
      window.location.href = '/';
    } else {
      // If already on homepage, find the first slide section and scroll to it
      const firstSlideSection = document.querySelector('section.min-h-screen:first-of-type');
      
      if (firstSlideSection) {
        firstSlideSection.scrollIntoView({ behavior: 'smooth' });
        setCurrentSlide(0);
      } else {
        // Fallback to scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentSlide(0);
      }
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Visit", href: "/visit" },
    { label: "Giving", href: "/giving" },
  ];

  return (
    <>
      {/* Mobile Navbar */}
      <nav
        className={`md:hidden fixed top-0 left-0 right-0 ${navStyles.bg} backdrop-blur-lg border-b ${navStyles.border} h-16 px-4 flex items-center justify-between z-50 font-sans transition-all duration-500`}
      >
        <button onClick={navigateToFirstSlide} className="flex items-center">
          <Image
            src={navStyles.logo}
            alt="Praise Church West Covina logo"
            width={32}
            height={32}
            priority
            className="w-8 h-auto"
          />
        </button>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen((o) => !o)}
          className={`p-2 rounded-lg transition relative z-[60] ${
            navStyles.text === "text-white" ? "text-white" : "text-gray-800"
          }`}
          aria-label="Toggle menu"
        >
          <motion.div
            animate={{ rotate: menuOpen ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {menuOpen ? (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </motion.div>
        </motion.button>
      </nav>

      {/* Full-Page Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 z-[100] md:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Full Page Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed inset-0 z-[110] flex flex-col justify-center p-6 md:hidden ${
                navStyles.text === "text-white" ? "bg-neutral-900" : "bg-white"
              }`}
            >
              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setMenuOpen(false)}
                className={`absolute top-6 right-6 rounded-lg ${
                  navStyles.text === "text-white"
                    ? "text-white hover:bg-white/10"
                    : "text-gray-800 hover:bg-gray-100"
                } transition-colors duration-200`}
                aria-label="Close menu"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>

              {/* Menu Items */}
              <div className="max-w-md h-full flex flex-col justify-end">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.1,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                    className="mb-2"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block py-1 text-3xl font-serif font-light tracking-wide transition-all duration-300 ${
                        pathname === item.href
                          ? navStyles.text === "text-white"
                            ? "text-orange-300"
                            : "text-orange-600"
                          : navStyles.text === "text-white"
                          ? "text-white hover:text-orange-300"
                          : "text-gray-900 hover:text-orange-600"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col h-full justify-end">
                {/* Separator */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{
                    delay: 0.4 + navItems.length * 0.05,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="origin-left"
                >
                  <Separator
                    className={
                      navStyles.text === "text-white"
                        ? "bg-white"
                        : "bg-gray-900"
                    }
                    delay={0}
                  />
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.5 + navItems.length * 0.05,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className={`max-w-md ${
                    navStyles.text === "text-white"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  <div className="space-y-4 font-serif">
                    <div>
                      <h3
                        className={`text-lg font-medium mb-2 ${
                          navStyles.text === "text-white"
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        Praise Church West Covina
                      </h3>
                      <p className="text-sm font-sans">
                        718 S. Azusa Avenue
                        <br />
                        West Covina, CA 91791
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-sans">
                        Sunday Service
                        <br />
                        10:30 AM
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="tel:+16262510952"
                        className={`block text-sm font-sans transition-colors duration-200 ${
                          navStyles.text === "text-white"
                            ? "text-orange-300 hover:text-orange-200"
                            : "text-orange-600 hover:text-orange-700"
                        }`}
                      >
                        (626) 251-0952
                      </a>
                      <a
                        href="mailto:praisechurchwc@gmail.com"
                        className={`block text-sm font-sans transition-colors duration-200 ${
                          navStyles.text === "text-white"
                            ? "text-orange-300 hover:text-orange-200"
                            : "text-orange-600 hover:text-orange-700"
                        }`}
                      >
                        praisechurchwc@gmail.com
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
