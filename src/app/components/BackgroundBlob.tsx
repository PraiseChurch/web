"use client";
import { motion } from "framer-motion";
import React from "react";
import styles from "./BackgroundBlob.module.css";

export const BackgroundBlob = () => {
  const blobOneVariants = {
    animate: {
      scale: [1, 1.2, 1.1, 1],
      rotate: [0, 360],
      x: ["0%", "10%", "0%"],
      y: ["0%", "10%", "0%"],
      skewX: [0, 10, 0],
      skewY: [0, 10, 0],
      transition: {
        duration: 50,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const blobTwoVariants = {
    animate: {
      scale: [1, 1.5, 1.3, 1],
      rotate: [0, -360],
      x: ["0%", "10%", "0%"],
      y: ["0%", "10%", "0%"],
      skewX: [0, 5, 0],
      skewY: [0, 20, 0],
      transition: {
        duration: 40,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const blobThreeVariants = {
    animate: {
      scale: [1, 2, 1.8, 1],
      rotate: [0, 360],
      x: ["0%", "10%", "0%"],
      y: ["0%", "10%", "0%"],
      skewX: [0, 20, 0],
      skewY: [0, 10, 0],
      transition: {
        duration: 60,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3 }}
    >
      <motion.div
        className={`${styles.blobBase} ${styles.blobOne}`}
        variants={blobOneVariants}
        initial="start"
        animate="animate"
      />
    </motion.div>
  );
};
