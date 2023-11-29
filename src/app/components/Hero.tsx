"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { FluidContainer, Typography } from "../components";
import { BackgroundBlob } from "./BackgroundBlob";
import { AnimatedLetters } from "./AnimatedLetters";

interface HeroProps {
  backgroundColor?: string;
  fontColor?: string;
  position?: "top" | "left" | "center" | "right" | "bottom";
  postTitle?: string;
  preTitle?: string;
  imgSrc?: string;
  title?: string;
}
export const Hero: React.FC<HeroProps> = ({
  imgSrc,
  position,
  preTitle,
  postTitle,
  title,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const backgroundImageStyle = imgSrc
    ? {
        backgroundImage: `url(${imgSrc})`,
        backgroundPosition: `${position}`,
      }
    : {};

  return (
    <div className="relative h-screen w-screen bg-cover flex flex-col justify-center items-center px-5">
      <BackgroundBlob />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        style={{
          rotateX: mousePosition.y * -20,
          rotateY: mousePosition.x * 20,
        }}
        className="flex flex-col justify-center items-center text-center gap-y-4"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Typography
            color="text-orange"
            variant="navSubheading"
            size="text-xl"
          >
            Welcome to
          </Typography>
        </motion.div>
        <div>
          <AnimatedLetters text="Praise Church" />
        </div>
        <div>
          <AnimatedLetters text="West Covina" />
        </div>
      </motion.div>
    </div>
  );
};
