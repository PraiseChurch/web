"use client";

import React from "react";
import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
  containerClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  titleClassName = "",
  subtitleClassName = "",
  containerClassName = ""
}) => {
  return (
    <div className={`flex flex-col items-center gap-4 px-4 ${containerClassName}`}>
      {icon && (
        <motion.div
          className="mb-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          {icon}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <Typography 
          variant="h2" 
          className={`text-center font-serif ${titleClassName}`}
        >
          {title}
        </Typography>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      >
        <Typography 
          variant="lead" 
          className={`text-center max-w-3xl mx-auto font-serif ${subtitleClassName}`}
        >
          {subtitle}
        </Typography>
      </motion.div>
    </div>
  );
};
