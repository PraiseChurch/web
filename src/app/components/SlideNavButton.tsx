import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function SlideNavButton({ direction, label, onClick, backgroundColor, textColor }: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
  backgroundColor?: string;
  textColor?: string;
}) {
  const txtClass = textColor || "text-gray-900";
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 ${txtClass} font-serif font-medium text-left group cursor-pointer hover:opacity-70 transition-opacity duration-200 bg-transparent border-none p-0`}
    >
      {direction === "prev" && (
        <motion.span
          className="inline-flex group-hover:translate-x-[-8px] transition-transform duration-500"
        >
          <ArrowLeft size={18} />
        </motion.span>
      )}
      <span>{label}</span>
      {direction === "next" && (
        <motion.span
          className="inline-flex group-hover:translate-x-[8px] transition-transform duration-500"
        >
          <ArrowRight size={18} />
        </motion.span>
      )}
    </button>
  );
}
