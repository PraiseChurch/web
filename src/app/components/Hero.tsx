import React from "react";
import { FluidContainer, Typography } from "../components";
import { BackgroundBlob } from "./BackgroundBlob";
interface HeroProps {
  backgroundColor?: string;
  fontColor?: string;
  position?: "top" | "left" | "center" | "right" | "bottom";
  postTitle?: string;
  preTitle?: string;
  imgSrc?: string;
  title?: string;
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
    >
      <BackgroundBlob />
    </div>
  );
};
