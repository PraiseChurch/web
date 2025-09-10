"use client";
import { motion, AnimatePresence } from "framer-motion";

import { useRef, useState, useCallback, useEffect } from "react";
import { SlideNavButton } from "./components/SlideNavButton";
import { slideData } from "../constants/slides";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Function to get text colors based on slide background
  const getTextColor = (slideBg: string) => {
    switch (slideBg) {
      case "bg-slide-dark":
        return "text-slide-dark";
      case "bg-slide-orange":
        return "text-slide-orange";
      case "bg-white":
        return "text-gray-900";
      default:
        return "text-gray-900";
    }
  };
  
  // Refs for each slide
  const slideRefs = [
    useRef<HTMLDivElement>(null), // Slide 1
    useRef<HTMLDivElement>(null), // Slide 2
    useRef<HTMLDivElement>(null), // Slide 3
    useRef<HTMLDivElement>(null), // Slide 4
  ];

  // Scroll to slide by index
  const scrollToSlide = useCallback((idx: number) => {
    const ref = slideRefs[idx]?.current;
    if (ref) {
      setCurrentSlide(idx);
      ref.scrollIntoView({ behavior: "smooth" });
    }
  }, [slideRefs]);

  // Intersection Observer to detect current slide
  useEffect(() => {
    const observers = slideRefs.map((ref, idx) => {
      if (!ref.current) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentSlide(idx);
          }
        },
        { threshold: 0.5 }
      );
      
      observer.observe(ref.current);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  return (
    <main
      className="min-h-screen w-full bg-white flex flex-col snap-y snap-proximity overflow-y-auto h-screen pb-32"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Slides with navigation */}
      {slideData(currentSlide, scrollToSlide).map((slide, idx, arr) => (
        <section
          key={slide.title}
          ref={slideRefs[idx]}
          className={`min-h-screen flex flex-col items-center justify-center ${slide.bg} border-t border-gray-200 snap-start ${slide.font}`}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ margin: "-100px" }}
              transition={{ 
                duration: 1.2, 
                ease: [0.25, 0.25, 0, 1],
                staggerChildren: 0.15
              }}
              className={`flex flex-col ${slide.alignment} ${slide.isSpecialSlide ? 'max-w-7xl w-full px-8' : 'max-w-5xl'}`}
            >
              {slide.content}
              {/* SlideNavButton controls spaced left/right - hidden for special slides */}
              {!slide.isSpecialSlide && (
                <div className="flex justify-between items-center w-full mt-12">
                  <div className="flex text-left">
                    {idx > 0 && (
                      <SlideNavButton
                        direction="prev"
                        label={arr[idx - 1].title}
                        onClick={() => scrollToSlide(idx - 1)}
                        textColor={idx === 1 ? "text-gray-400" : getTextColor(arr[idx - 1].bg)}
                      />
                    )}
                  </div>
                  <div className="flex text-end">
                    {idx < arr.length - 1 && (
                      <SlideNavButton
                        direction="next"
                        label={arr[idx + 1].title}
                        onClick={() => scrollToSlide(idx + 1)}
                        textColor={getTextColor(arr[idx + 1].bg)}
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      ))}
    </main>
  );
}
