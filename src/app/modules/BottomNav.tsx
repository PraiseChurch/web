"use client";
import { useEffect, useRef, useState } from "react";
import { Typography } from "../components";
import { motion } from "framer-motion";

export const BottomNav = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const [bottomNavHeight, setBottomNavHeight] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0 && !hasScrolled) {
        setHasScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  useEffect(() => {
    if (navRef.current) {
      console.log("Nav height:", navRef.current.offsetHeight);
      setBottomNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  return (
    <>
      {bottomNavHeight > 0 && (
        <motion.div
          initial={{ width: "0xp", backgroundColor: "#E2E2E2" }}
          animate={{ width: "100vw", backgroundColor: "transparent" }}
          transition={{ duration: 4 }}
          className="fixed w-full bottom-0 left-0 right-0 bg-transparent py-8 border-t-2 border-gray-200 z-30"
          style={{
            height: `${bottomNavHeight}px`,
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
          }}
        />
      )}
      <motion.div
        ref={navRef}
        initial={{
          borderTopColor: "transparent",
          borderTopWidth: 0,
          opacity: 0,
        }}
        animate={{
          borderTopColor: "#E2E2E2",
          borderTopWidth: 1,
          opacity: 1,
        }}
        transition={{
          duration: 1, // Immediate transition
          delay: 2, // Delay of 8 seconds
        }}
        className="fixed w-full bottom-0 left-0 right-0 z-50"
      >
        <div className="flex w-full justify-between">
          <motion.div
            initial={{ backgroundColor: "#FFF" }}
            whileHover={{ backgroundColor: "#FAFAFA" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex justify-center items-center w-1/3 justify-between px-4 border-r-2 border-gray-100"
          >
            <div className="flex justify-between w-full py-8">
              <div className="flex flex-col">
                <Typography variant="bottomNavText" color="text-dark-gray">
                  Sundays at 10am
                </Typography>
                <Typography variant="bottomNavText" color="text-dark-gray">
                  Shadow Oak Park, CA
                </Typography>
              </div>
              <div className="flex items-center">
                <Typography variant="bottomNavText" color="text-orange">
                  Visit Us
                </Typography>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ backgroundColor: "#FFF" }}
            whileHover={{ backgroundColor: "#FAFAFA" }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="flex justify-center items-center w-1/3 justify-between px-4 border-r-2 border-gray-100"
          >
            <div className="flex justify-between w-full py-8">
              <div className="flex flex-col w-1/2">
                <Typography variant="bottomNavText" color="text-dark-gray">
                  Get involved with our different ministries
                </Typography>
              </div>
              <div className="flex items-center">
                <Typography variant="bottomNavText" color="text-orange">
                  Our Ministries
                </Typography>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ backgroundColor: "#FFF" }}
            whileHover={{ backgroundColor: "#FAFAFA" }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="flex justify-center items-center w-1/3 justify-between px-4 border-r-2 border-gray-100"
          >
            <div className="flex justify-between w-full py-8">
              <div className="flex flex-col w-1/2">
                <Typography variant="bottomNavText" color="text-dark-gray">
                  Find fellowship with our community
                </Typography>
              </div>
              <div className="flex items-center">
                <Typography variant="bottomNavText" color="text-orange">
                  Upcoming Events
                </Typography>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};
