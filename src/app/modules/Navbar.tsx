"use client";
import React, { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { Typography } from "../components";
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const toggleMenu = () => setMobileNavOpen(!mobileNavOpen);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black h-16 py-3 px-4 drop-shadow-md z-50">
        <div className="container mx-auto flex justify-between items-center top-0 max-w-screen-lg">
          <Link href="/">
            <Image
              src="/tulip-logo-white.png"
              alt="praise church west covina logo"
              className="opacity-1"
              width={32}
              height={32}
              priority
            />
          </Link>
          <div className="container hidden text-white md:flex md:justify-around md:max-w-screen-sm">
            <Link href="about">
              <Typography variant="navSubheading">About</Typography>
            </Link>
            <Link href="https://www.youtube.com/@PraiseChurch/streams" aria-label="praise church youtube stream">
              <Typography variant="navSubheading">Stream</Typography>
            </Link>
            <Link href="visit">
              <Typography variant="navSubheading">Visit</Typography>
            </Link>
            <Link href="giving">
              <Typography variant="navSubheading">Giving</Typography>
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
      </nav>
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
