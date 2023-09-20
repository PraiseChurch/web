import React from "react";
import Link from "next/link";
import { Typography } from "../components";
import { AiOutlineYoutube } from "react-icons/ai";
import { BiLogoFacebookCircle } from "react-icons/bi";
import { BsInstagram } from "react-icons/bs";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between max-w-screen-lg">
        <div className="w-1/3">
          <h2 className="text-lg font-semibold">Column 1</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
        </div>
        <div className="w-1/3">
          <h2 className="text-lg font-semibold">Column 2</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className="w-1/3">
          <h2 className="text-lg font-semibold">Column 3</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
      <div className="container mx-auto flex justify-center max-w-screen-lg">
        <hr className="w-4/5 my-8" />
      </div>
      <div className="container mx-auto flex justify-between max-w-screen-lg">
        <div className="container flex justify-between max-w-screen-md items-center">
          <Typography variant="caption" color="text-white">
            &copy; {currentYear} Praise Church West Covina
          </Typography>
          <Typography variant="caption" color="text-white" size="text-xl">
            |
          </Typography>
          <Typography variant="caption" color="text-white">
            Shadow Oak Park, West Covina, CA 91792
          </Typography>
          <Typography variant="caption" color="text-white" size="text-xl">
            |
          </Typography>
          <Typography variant="caption" color="text-white">
            (626) 251-0952
          </Typography>
        </div>
        <div className="flex items-center">
          <Link href="https://www.instagram.com/praisechurchwc/">
            <BsInstagram size="22" color="white" className="mx-1" />
          </Link>
          <Link href="https://www.youtube.com/@PraiseChurch">
            <AiOutlineYoutube size="30" color="white" />
          </Link>
        </div>
      </div>
    </footer>
  );
};
