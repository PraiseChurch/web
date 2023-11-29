"use client";
import React, { useEffect, useRef, useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { Typography } from "../components";
import Link from "next/link";
import { motion } from "framer-motion";

export const Navbar = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const toggleMenu = () => setMobileNavOpen(!mobileNavOpen);

  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(0);
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
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  return (
    <>
      {navHeight > 0 && (
        <motion.div
          initial={{ width: "0px", backgroundColor: "#E2E2E2" }}
          animate={{ width: "100vw", backgroundColor: "transparent" }}
          transition={{ duration: 2 }}
          className="fixed w-full top-0 left-0 right-0 bg-transparent py-8 border-b-2 border-gray-200 z-30"
          style={{
            height: `${navHeight}px`,
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
          }}
        />
      )}
      <motion.nav
        ref={navRef}
        className="fixed w-full top-0 left-0 right-0 bg-transparent py-8 px-4 z-50"
      >
        <div className="container m-auto flex justify-between items-center top-0">
          <Link href="/">
            <motion.img
              src="/tulip-solo-white.svg"
              alt="praise church west covina logo"
              width={45}
              height={45}
              whileHover={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ duration: 0.5 }}
            />
          </Link>
          <div className="container flex justify-between w-1/2 hidden text-white md:flex md:max-w-screen-sm">
            <Link href="about">
              <Typography useMotion variant="navSubheading">
                About
              </Typography>
            </Link>
            <Link
              href="https://www.youtube.com/@PraiseChurch/streams"
              aria-label="praise church youtube stream"
              target="_blank"
            >
              <Typography useMotion variant="navSubheading">
                Stream
              </Typography>
            </Link>
            <Link href="visit">
              <Typography useMotion variant="navSubheading">
                Visit
              </Typography>
            </Link>
            <Link href="giving">
              <Typography useMotion variant="navSubheading">
                Giving
              </Typography>
            </Link>
          </div>
          <div className="md:hidden flex space-x-4">
            {!mobileNavOpen ? (
              <button>
                <RxHamburgerMenu
                  color="white"
                  size="32"
                  margin="auto 0px"
                  onClick={() => {
                    toggleMenu();
                  }}
                />
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
      </motion.nav>
      {mobileNavOpen ? (
        <div
          className="m-0 top-0 left-0 h-full w-full fixed opacity-90 bg-black z-50 text-slate-100 p-5 flex flex-col items-end justify-start"
          onClick={() => toggleMenu()}
        >
          <Link href="about">
            <Typography variant="mobileNavSubheading">About</Typography>
          </Link>
          <Link href="https://www.youtube.com/@PraiseChurch/streams">
            <Typography variant="mobileNavSubheading">Stream</Typography>
          </Link>
          <Link href="visit">
            <Typography variant="mobileNavSubheading">Visit</Typography>
          </Link>
          <Link href="giving">
            <Typography variant="mobileNavSubheading">Giving</Typography>
          </Link>
        </div>
      ) : (
        ""
      )}
    </>
  );
};
