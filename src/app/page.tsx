"use client";
import { motion, AnimatePresence } from "framer-motion";

import { useRef } from "react";
import { SlideNavButton } from "./components/SlideNavButton";
import { slideData } from "../constants/slides";

export default function Home() {
  // Refs for each slide
  const slideRefs = [
    useRef<HTMLDivElement>(null), // Slide 1
    useRef<HTMLDivElement>(null), // Slide 2
    useRef<HTMLDivElement>(null), // Slide 3
    useRef<HTMLDivElement>(null), // Slide 4
  ];

  // Scroll to slide by index
  const scrollToSlide = (idx: number) => {
    const ref = slideRefs[idx]?.current;
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main
      className="min-h-screen w-full bg-white flex flex-col snap-y snap-proximity overflow-y-auto h-screen"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Slides with navigation */}
      {slideData.map((slide, idx, arr) => (
        <section
          key={slide.title}
          ref={slideRefs[idx]}
          className={`min-h-screen flex flex-col items-center justify-center ${slide.bg} border-t border-gray-200 snap-start ${slide.font}`}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`flex flex-col ${slide.alignment} max-w-5xl`}
            >
              {slide.content}
              {/* SlideNavButton controls spaced left/right */}
              <div className="flex justify-between items-center w-full mt-12">
                <div className="flex text-left">
                  {idx > 0 && (
                    <SlideNavButton
                      direction="prev"
                      label={arr[idx - 1].title}
                      onClick={() => scrollToSlide(idx - 1)}
                    />
                  )}
                </div>
                <div className="flex text-end">
                  {idx < arr.length - 1 && (
                    <SlideNavButton
                      direction="next"
                      label={arr[idx + 1].title}
                      onClick={() => scrollToSlide(idx + 1)}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      ))}
    </main>
  );
}
