import { Separator } from "../app/components/Separator";
import { motion } from "framer-motion";

export const slideTitles = [
  "Praise Church West Covina",
  "Our Mission of Hope",
  "Our Motivation by Faith",
  "Our Means through Love",
];

export const slideData = (currentSlide: number) => [
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
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {slideTitles[0]}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            A modern, friendly church community in West Covina, CA
          </motion.p>
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
          className="text-5xl text-left"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.25, 0, 1] }}
        >
          <span className="font-normal">Our Mission</span>{" "}
          <span className="font-bold italic">of Hope</span>
        </motion.h2>
        <Separator
          className="w-24 mb-6"
          delay={0.4}
          slideActive={currentSlide === 1}
        />
        <motion.p
          className="text-xl text-gray-700 max-w-xl lg:max-w-7xl lg:min-w-4xl text-left"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          is to spread the glory of God's presence in West Covina and beyond
        </motion.p>
      </>
    ),
    bg: "bg-gray-50",
    font: "font-serif",
    alignment: "items-start",
  },
  {
    title: slideTitles[2],
    content: (
      <>
        <motion.h2
          className="text-5xl text-left"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.25, 0, 1] }}
        >
          <span className="font-normal">Our Motivation</span>{" "}
          <span className="font-bold italic">by Faith</span>
        </motion.h2>
        <Separator
          className="w-24 mb-6"
          delay={0.4}
          slideActive={currentSlide === 2}
        />
        <motion.p
          className="text-xl text-gray-700 max-w-xl lg:max-w-7xl lg:min-w-4xl text-left"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          is the unshakable confidence in Christ’s finished work and His ongoing
          reign
        </motion.p>
      </>
    ),
    bg: "bg-white",
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
          <span className="font-normal">Our Means</span>{" "}
          <span className="font-bold italic">through Love</span>
        </motion.h2>
        <Separator
          className="w-24 mb-6"
          delay={0.4}
          slideActive={currentSlide === 3}
        />
        <motion.p
          className="text-xl text-gray-700 max-w-xl lg:max-w-7xl lg:min-w-4xl text-left"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          is the surpassing joy of God's indwelling Spirit in our hearts
        </motion.p>
      </>
    ),
    bg: "bg-white",
    font: "font-serif",
    alignment: "items-start",
  },
];
