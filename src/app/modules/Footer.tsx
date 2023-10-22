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
        <div className="container mx-auto md:w-1/3 flex justify-center md:justify-start my-2">
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
        <div className="container mx-auto flex flex-col items-center md:flex-row md:w-2/3 md:justify-between">
          <div className="h-1/3 my-1">
            <span className="border-b border-accent-green hover:border-white py-1">
              <Link href="https://calendar.google.com/calendar/u/3?cid=cHJhaXNlY2h1cmNod2NAZ21haWwuY29t">
                <Typography variant="button">Calendar</Typography>
              </Link>
            </span>
          </div>
          <div className="h-1/3 my-1">
            <span className="border-b border-accent-green hover:border-white py-1">
              <a href="mailto:praisechurchwc@gmail.com">
                <Typography variant="button">Contact Us</Typography>
              </a>
            </span>
          </div>
          <div className="h-1/3 my-1">
            <span className="border-b border-accent-green hover:border-white py-1">
              <Link href="giving">
                <Typography variant="button">Give</Typography>
              </Link>
            </span>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex justify-center max-w-screen-lg">
        <hr className="w-4/5 md: my-8" />
      </div>
      <div className="container mx-auto flex flex-col justify-between max-w-screen-lg md:flex-row">
        <div className="container flex flex-col justify-between max-w-screen-md items-center md:flex-row mr-8">
          <Typography variant="navSubheading" color="text-white">
            &copy; {currentYear} Praise Church
          </Typography>
          <Link href="https://www.google.com/maps/place/Shadow+Oak+Park/@34.019624,-117.9025796,17z/data=!3m1!4b1!4m6!3m5!1s0x80c32a22a97be2b1:0xa7984eaf0c6e986a!8m2!3d34.019624!4d-117.9000047!16s%2Fg%2F1thxwhcf?entry=ttu">
            <Typography variant="navSubheading" color="text-white">
              Shadow Oak Park, West Covina, CA 91792
            </Typography>
          </Link>
          <Typography variant="navSubheading" color="text-white">
            (626) 251-0952
          </Typography>
        </div>
        <div className="flex items-center justify-center pb-1 md:pb-0">
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
