import { Separator } from "../app/components/Separator";
import { ScrollIndicator } from "../app/components/ScrollIndicator";
import { PageHeader } from "../app/components/PageHeader";
import { motion } from "framer-motion";
import { Church } from "lucide-react";

export const slideTitles = [
  "Praise Church West Covina",
  "Our Mission of Hope",
  "Our Motivation by Faith",
  "Our Means through Love",
];

export const slideData = (
  currentSlide: number,
  scrollToSlide?: (idx: number) => void
) => [
  {
    title: slideTitles[0],
    content: (
      <>
        <motion.div
          className="text-center min-h-[60vh] flex flex-col justify-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <PageHeader
            icon={<Church className="w-12 h-12 text-orange-500" />}
            title={slideTitles[0]}
            subtitle="Rooted in Scripture. Centered on Christ. Growing in Grace."
          />

          {/* Scrolling Line Indicator */}
          <motion.div
            className="my-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            <ScrollIndicator />
          </motion.div>

          {/* Text-based CTA */}
          <motion.button
            className="text-lg font-serif text-gray-700 hover:text-gray-900 cursor-pointer transition-colors duration-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
            onClick={() => scrollToSlide && scrollToSlide(1)}
          >
            Who We Are
          </motion.button>
        </motion.div>
      </>
    ),
    bg: "bg-white",
    font: "",
    alignment: "items-center justify-center",
    isSpecialSlide: true,
  },
  {
    title: slideTitles[1],
    content: (
      <>
        <motion.h2
          className="text-5xl text-left text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.25, 0, 1] }}
        >
          <span className="font-thin">Our Mission</span>{" "}
          <span className="font-bold italic">of Hope</span>
        </motion.h2>
        <Separator
          className="mb-6 bg-white"
          delay={0.4}
          slideActive={currentSlide === 1}
        />
        <motion.p
          className="text-xl text-white max-w-xl lg:max-w-7xl lg:min-w-4xl text-left"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          is to spread the glory of God&apos;s presence in West Covina and beyond
        </motion.p>
      </>
    ),
    bg: "bg-slide-dark",
    font: "font-serif",
    alignment: "items-start",
  },
  {
    title: slideTitles[2],
    content: (
      <>
        <motion.h2
          className="text-5xl text-left text-slide-dark"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.25, 0, 1] }}
        >
          <span className="font-thin">Our Motivation</span>{" "}
          <span className="font-bold italic">by Faith</span>
        </motion.h2>
        <Separator
          className="mb-6 bg-slide-dark"
          delay={0.4}
          slideActive={currentSlide === 2}
        />
        <motion.p
          className="text-xl text-slide-dark max-w-xl lg:max-w-7xl lg:min-w-4xl text-left"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          is the unshakable confidence in Christ&apos;s finished work and His ongoing
          reign
        </motion.p>
      </>
    ),
    bg: "bg-slide-orange",
    font: "font-serif",
    alignment: "items-start",
  },
  {
    title: slideTitles[3],
    content: (
      <>
        <motion.h2
          className="text-5xl text-left"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.25, 0, 1] }}
        >
          <span className="font-thin">Our Means</span>{" "}
          <span className="font-bold italic">through Love</span>
        </motion.h2>
        <Separator
          className="mb-6"
          delay={0.4}
          slideActive={currentSlide === 3}
        />
        <motion.p
          className="text-xl text-gray-700 max-w-xl lg:max-w-7xl lg:min-w-4xl text-left"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          is the surpassing joy of God&apos;s indwelling Spirit in our hearts
        </motion.p>
      </>
    ),
    bg: "bg-white",
    font: "font-serif",
    alignment: "items-start",
  },
];
