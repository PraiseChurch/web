import React from "react";
import { FluidContainer, Typography } from "../components";
interface HeroProps {
  backgroundColor?: string;
  fontColor?: string;
  position?: "top" | "left" | "center" | "right" | "bottom";
  postTitle?: string;
  preTitle?: string;
  imgSrc?: string;
  title: string;
}
export const Hero: React.FC<HeroProps> = ({
  imgSrc,
  position,
  preTitle,
  postTitle,
  title,
}) => {
  const backgroundImageStyle = imgSrc
    ? {
        backgroundImage: `url(${imgSrc})`,
        backgroundPosition: `${position}`,
      }
    : {};

  return (
    <div
      className={`h-screen w-screen bg-cover flex flex-col justify-center items-center px-5`}
      style={backgroundImageStyle}
    >
      <span className="bg-black">
        <Typography
          variant="heroSubheading"
          color="text-white"
          fontStyle="italic"
        >
          {preTitle}
        </Typography>
      </span>
      <div className="bg-black my-3 flex flex-col justify-center items-center">
        <Typography variant="heading" color="text-white" letterCase="uppercase">
          {title}
        </Typography>
      </div>
        <div className="bg-black md:my-3 flex flex-col justify-center items-center text-center">
          <Typography
            variant="heroSubheading"
            color="text-white"
            fontStyle="italic"
          >
            {postTitle}
          </Typography>
        </div>
    </div>
  );
};
