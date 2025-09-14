"use client";
import { motion } from "framer-motion";

interface ScrollIndicatorProps {
  className?: string;
}

export function ScrollIndicator({ className = "" }: ScrollIndicatorProps) {
  return (
    <div className={`relative w-[0.25px] h-20 mx-auto overflow-hidden ${className}`}>
      {/* Subtle background track */}
      <div className="absolute inset-0 bg-gray-500 rounded-full" />

      {/* Main scrolling dot/line */}
      <motion.div
        className="absolute left-0 w-full bg-white rounded-full shadow-sm"
        style={{
          height: "25%", // Shorter, more like a moving dot
          top: "-25%", // Start above
        }}
        animate={{
          y: ["0%", "500%"], // Move through and beyond container
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />

      {/* Secondary dot for seamless continuation */}
      <motion.div
        className="absolute left-0 w-full bg-white rounded-full"
        style={{
          height: "25%",
          top: "-25%",
        }}
        animate={{
          y: ["0%", "500%"],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.5,
          delay: 1.75, // Staggered timing
        }}
      />
    </div>
  );
}
