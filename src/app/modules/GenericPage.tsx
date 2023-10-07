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
import { GenericPageProps, VerseProps } from "../types";

interface CombinedProps extends GenericPageProps, VerseProps {}
export const GenericPage: React.FC<CombinedProps> = ({
  continuation,
  heroImgSrc,
  heroTitle,
  position,
  text,
  verse,
}) => {
  return (
    <div>
      <Hero title={heroTitle} imgSrc={heroImgSrc} position={position} />
      <FluidContainer>
        <Verse verse={verse} continuation={continuation} text={text} />
      </FluidContainer>
    </div>
  );
};
