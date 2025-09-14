"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { Separator } from "./Separator";
import { CTA } from "./CTA";
import { ArrowDown } from "lucide-react";

interface AnimatedHeroProps {
  text: string;
  reference?: string;
  className?: string;
}

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  text,
  reference,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const scrollToNextSlide = () => {
    const nextSection = document.querySelector(".giving-methods-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;

    // Split main text into words
    const words = text.split(" ");
    const wordElements: HTMLSpanElement[] = [];

    textRef.current.innerHTML = "";

    words.forEach((word) => {
      const wordSpan = document.createElement("span");
      wordSpan.textContent = word;
      wordSpan.className = "inline-block opacity-0 mr-3 mb-2 font-serif";
      wordSpan.style.filter = "blur(10px)";
      wordSpan.style.transform = "translateY(100px)";

      wordElements.push(wordSpan);
      textRef.current!.appendChild(wordSpan);
    });

    // GSAP Animation Timeline
    const tl = gsap.timeline({ delay: 0.5 });

    // Animate main text words only
    tl.to(wordElements, {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
    });

    // Animate CTA button after text animation
    if (ctaRef.current) {
      tl.to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.3"
      );
    }

    // Cleanup function
    return () => {
      tl.kill();
    };
  }, [text, reference]);

  return (
    <div>
      <div
        ref={containerRef}
        className={`bg-slide-orange text-black h-screen flex items-center overflow-hidden ${className}`}
      >
        <div className="max-w-6xl mx-auto px-6">
          {reference && (
            <motion.div
              ref={referenceRef}
              className="text-neutral-black/10 font-sans text-xl w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              {reference}
            </motion.div>
          )}

          <Separator className="mb-6 bg-black" delay={0.8} />
          <div
            ref={textRef}
            className="text-4xl lg:text-5xl xl:text-6xl font-serif lg:mb-8 mb-3 leading-[1] lg:leading-[1.2] xl:leading-[1.4]"
          />

          <Separator className="bg-black mb-0" delay={0.8} />
          {/* Give CTA Button */}
          <div ref={ctaRef} className="w-full flex justify-end">
            <motion.button
              onClick={scrollToNextSlide}
              className="group flex items-center text-black"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="flex items-center px-4 py-2 bg-black text-white gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 2, ease: "easeOut" }}
              >
                <span className="flex-1 text-xl font-sans">Give</span>
                <ArrowDown className="h-5 w-5 group-hover:translate-y-1 transition-transform duration-200" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
