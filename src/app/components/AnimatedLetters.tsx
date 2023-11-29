"use client";
import { motion } from "framer-motion";
import { Typography } from ".";

type AnimatedLettersProps = {
  text: string;
};

export const AnimatedLetters = ({ text }: AnimatedLettersProps) => {
  const letters = Array.from(text);

  console.log({ letters });

  const render = letters.map((letter, index) => {
    const isSpace = letter === " ";

    return (
      <motion.div
        key={index}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: index * 0.05,
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          display: isSpace ? "inline" : "inline-block",
          marginRight: isSpace ? "1rem" : 0,
        }}
      >
        <Typography variant="heading">{letter}</Typography>
      </motion.div>
    );
  });

  return <div className="flex flex-row text-center">{render}</div>;
};
