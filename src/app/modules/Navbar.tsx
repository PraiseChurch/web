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
      <nav className="bg-black py-3 px-4">
        <div className="container mx-auto flex justify-between items-center top-0 max-w-screen-lg">
          <Link href="/" className="text-white font-semibold text-lg">
            <Image
              src="/tulip-logo-white.png"
              alt="praise church west covina logo"
              className="opacity-1"
              width={24}
              height={32}
              priority
            />
          </Link>
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
              <div className="">asdf</div>
            )}
          </div>
        </div>
      </nav>
      {mobileNavOpen ? (
        <div
          className="m-0 top-0 left-0 h-full w-full fixed opacity-90 bg-black z-50 text-slate-100 p-5 flex flex-col items-end justify-start"
          onClick={() => toggleMenu()}
        >
          <Typography variant="heading">about</Typography>
          <Typography variant="subheading">connect</Typography>
          <Typography variant="body">follow</Typography>
          <Typography variant="caption">follow</Typography>
        </div>
      ) : (
        ""
      )}
    </>
  );
};
