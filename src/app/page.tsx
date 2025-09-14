"use client";
import { motion, AnimatePresence } from "framer-motion";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { SlideNavButton } from "./components/SlideNavButton";
import { slideData } from "../constants/slides";
import { useSlideContext } from "../contexts/SlideContext";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setCurrentSlide: setContextSlide, setCurrentSlideBg } =
    useSlideContext();

  // Update context when slide changes
  useEffect(() => {
    const slides = slideData(currentSlide);
    const currentSlideBg = slides[currentSlide]?.bg || "bg-white";
    setContextSlide(currentSlide);
    setCurrentSlideBg(currentSlideBg);
  }, [currentSlide, setContextSlide, setCurrentSlideBg]);

  // Refs for each slide
  const slideRef1 = useRef<HTMLDivElement>(null);
  const slideRef2 = useRef<HTMLDivElement>(null);
  const slideRef3 = useRef<HTMLDivElement>(null);
  const slideRef4 = useRef<HTMLDivElement>(null);
  
  const slideRefs = useMemo(() => {
    return [slideRef1, slideRef2, slideRef3, slideRef4];
  }, [slideRef1, slideRef2, slideRef3, slideRef4]);

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

  // Scroll to slide by index
  const scrollToSlide = useCallback(
    (idx: number) => {
      const ref = slideRefs[idx]?.current;
      if (ref) {
        setCurrentSlide(idx);
        ref.scrollIntoView({ behavior: "smooth" });
      }
    },
    [slideRefs]
  );

  // Intersection Observer to detect current slide with smoother snapping
  useEffect(() => {
    const observers = slideRefs.map((ref, idx) => {
      if (!ref.current) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Snap when slide is 15% visible
          if (entry.intersectionRatio >= 0.15) {
            setCurrentSlide(idx);
            // Update context with current slide background
            const slides = slideData(idx);
            const slideBg = slides[idx]?.bg || "bg-white";
            setContextSlide(idx);
            setCurrentSlideBg(slideBg);
          }
        },
        {
          threshold: [0.15, 0.85], // Trigger at 15% and 85% visibility
          rootMargin: "-5% 0px -5% 0px", // Smaller margin for more precise detection
        }
      );

      observer.observe(ref.current);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  // Enhanced scroll snapping - snap to nearest slide when scrolling stops
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        // Find the slide that's most visible
        let mostVisibleSlide = 0;
        let maxVisibility = 0;

        slideRefs.forEach((ref, idx) => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate how much of the slide is visible
            const visibleTop = Math.max(
              0,
              Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
            );
            const visibilityRatio = visibleTop / viewportHeight;

            // If this slide is more than 15% visible and more visible than current max
            if (visibilityRatio >= 0.15 && visibilityRatio > maxVisibility) {
              maxVisibility = visibilityRatio;
              mostVisibleSlide = idx;
            }
          }
        });

        // Only snap if the difference is significant enough and not already transitioning
        if (mostVisibleSlide !== currentSlide && maxVisibility > 0.3) {
          scrollToSlide(mostVisibleSlide);
        }
      }, 300); // Increased wait time to 300ms for less abrupt snapping
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentSlide, scrollToSlide]);

  return (
    <main
      className="min-h-screen w-full bg-white flex flex-col snap-y snap-proximity overflow-y-auto h-screen pb-32"
      style={{
        scrollBehavior: "smooth",
        scrollSnapStop: "normal",
      }}
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
                staggerChildren: 0.15,
              }}
              className={`flex flex-col ${slide.alignment} ${
                slide.isSpecialSlide ? "max-w-7xl w-full px-8" : "max-w-5xl"
              }`}
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
                        textColor={
                          idx === 1
                            ? "text-gray-400"
                            : getTextColor(arr[idx - 1].bg)
                        }
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
