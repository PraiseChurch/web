import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function SlideNavButton({ direction, label, onClick }: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-1 text-blue-700 font-medium text-left group"
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
