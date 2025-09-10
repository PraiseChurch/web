"use client";
import { motion } from "framer-motion";

interface SeparatorProps {
  direction?: "horizontal" | "vertical";
  className?: string;
  delay?: number;
  slideActive?: boolean;
  continuous?: boolean;
}

export function Separator({ 
  direction = "horizontal", 
  className = "",
  delay = 0,
  slideActive = true,
  continuous = false
}: SeparatorProps) {
  const isHorizontal = direction === "horizontal";
  
  const baseClasses = isHorizontal 
    ? "my-6 h-px" 
    : "my-6 w-px";
    
  const defaultColor = className.includes('bg-') ? '' : 'bg-gray-300';
  const defaultWidth = isHorizontal && !className.includes('w-') ? 'w-full' : '';
  
  const animationProps = isHorizontal
    ? {
        initial: { scaleX: 0 },
        animate: continuous 
          ? { scaleX: [0, 1, 0] }
          : slideActive 
            ? { scaleX: 1 } 
            : { scaleX: 0 },
        style: { transformOrigin: "left center" }
      }
    : {
        initial: { scaleY: 0 },
        animate: continuous
          ? { scaleY: [0, 1, 0] }
          : slideActive 
            ? { scaleY: 1 } 
            : { scaleY: 0 },
        style: { transformOrigin: "bottom center" }
      };

  const transitionProps = continuous
    ? {
        duration: 2,
        delay,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatDelay: 0.5
      }
    : {
        duration: 0.8,
        delay,
        ease: "easeOut" as const
      };

  return (
    <motion.div
      className={`${baseClasses} ${defaultWidth} ${defaultColor} ${className}`}
      initial={animationProps.initial}
      animate={animationProps.animate}
      style={animationProps.style}
      transition={transitionProps}
    />
  );
}
