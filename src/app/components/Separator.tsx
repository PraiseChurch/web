"use client";
import { motion } from "framer-motion";

interface SeparatorProps {
  direction?: "horizontal" | "vertical";
  className?: string;
  delay?: number;
  slideActive?: boolean;
}

export function Separator({ 
  direction = "horizontal", 
  className = "",
  delay = 0,
  slideActive = true
}: SeparatorProps) {
  const isHorizontal = direction === "horizontal";
  
  const baseClasses = isHorizontal 
    ? "my-6 h-px bg-gray-300" 
    : "my-6 w-px bg-gray-300";
  
  const animationProps = isHorizontal
    ? {
        initial: { scaleX: 0 },
        animate: slideActive ? { scaleX: 1 } : { scaleX: 0 },
        style: { transformOrigin: "left center" }
      }
    : {
        initial: { scaleY: 0 },
        animate: slideActive ? { scaleY: 1 } : { scaleY: 0 },
        style: { transformOrigin: "bottom center" }
      };

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      initial={animationProps.initial}
      animate={animationProps.animate}
      style={animationProps.style}
      transition={{
        duration: 0.8,
        delay,
        ease: "easeOut"
      }}
    />
  );
}
