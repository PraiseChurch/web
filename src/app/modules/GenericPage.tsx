import React, { ReactNode } from "react";
import Image from "next/image";
import {
  Divider,
  FluidContainer,
  Hero,
  TextSubsection,
  Typography,
  Verse,
} from "../components";
import { VerseProps } from "../types";

interface GenericPageProps {
  children?: ReactNode;
  heroTitle?: string;
  heroImgSrc?: string;
  position?: "center" | "top" | "left" | "right" | "bottom" | undefined;
}

interface CombinedProps extends GenericPageProps, VerseProps {}
export const GenericPage: React.FC<CombinedProps> = ({
  heroImgSrc,
  heroTitle,
  position,
}) => {
  return (
    <div>
      <Hero title={heroTitle} imgSrc={heroImgSrc} position={position} />
      <FluidContainer>
        <Verse />
      </FluidContainer>
    </div>
  );
};
