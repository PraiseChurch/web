"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-center font-sans">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <h1 className="text-5xl font-bold mb-4">Praise Church West Covina</h1>
          <p className="text-lg text-gray-600 mb-8">A modern, friendly church community in West Covina, CA</p>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
