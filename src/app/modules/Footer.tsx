import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Typography } from "../components";
import { AiFillFacebook, AiFillInstagram, AiFillYoutube } from "react-icons/ai";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-footer-dark-grey text-white py-3 px-4">
      <div className="container mx-auto flex flex-col justify-center max-w-screen-lg md:flex-row md:justify-evenly">
        <div className="container mx-auto mb-2 md:w-1/3 flex justify-center md:justify-start">
          <Link href="/">
            <Image
              src="/tulip-logo-white.png"
              alt="praise church west covina logo"
              className="opacity-1"
              width={45}
              height={45}
              priority
            />
          </Link>
        </div>
        <div className="container mx-auto flex flex-col items-center md:flex-row md:w-2/3 md:justify-evenly">
          <div className="h-1/3">
            <h2 className="text-lg font-semibold border-b border-accent-blue hover:border-white">
              Calendar
            </h2>
            {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p> */}
          </div>
          <div className="h-1/3">
            <h2 className="text-lg font-semibold border-b border-accent-blue hover:border-white">
              Contact Us
            </h2>
            {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
          </div>
          <div className="h-1/3">
            <h2 className="text-lg font-semibold border-b border-accent-blue hover:border-white">
              Give
            </h2>
            {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
          </div>
        </div>
      </div>
      <div className="container mx-auto flex justify-center max-w-screen-lg">
        <hr className="w-4/5 my-8" />
      </div>
      <div className="container mx-auto flex flex-col justify-between max-w-screen-lg md:flex-row">
        <div className="container flex flex-col justify-between max-w-screen-md items-center md:flex-row mr-8">
          <Typography variant="caption" color="text-white">
            &copy; {currentYear} Praise Church
          </Typography>
          <Typography variant="caption" color="text-white">
            Shadow Oak Park, West Covina, CA 91792
          </Typography>
          <Typography variant="caption" color="text-white">
            (626) 251-0952
          </Typography>
        </div>
        <div className="flex items-center justify-center">
          <div className="bg-white hover:opacity-100 rounded-full w-7 h-7 flex items-center justify-center mx-0.5 my-1 md:opacity-80">
            <Link href="https://www.facebook.com/praisechurchwc">
              <span>
                <AiFillFacebook size="20" color="black" />
              </span>
            </Link>
          </div>
          <Link href="https://www.instagram.com/praisechurchwc/">
            <div className="bg-white hover:opacity-100 rounded-full w-7 h-7 flex items-center justify-center mx-0.5 my-1 md:opacity-80">
              <span>
                <AiFillInstagram size="20" color="black" />
              </span>
            </div>
          </Link>
          <Link href="https://www.youtube.com/@PraiseChurch">
            <div className="bg-white hover:opacity-100 rounded-full w-7 h-7 flex items-center justify-center mx-0.5 my-1 md:opacity-80">
              <AiFillYoutube size="20" color="black" />
            </div>
          </Link>
        </div>
      </div>
    </footer>
  );
};
