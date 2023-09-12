"use client";
import React, { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
// components/Navbar.js
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const toggleMenu = () => setMobileNavOpen(!mobileNavOpen);

  return (
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
  );
};
