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
  heroPostTitle,
  heroTitle,
  position,
  subSectionArray,
  subSectionChildren,
  subSectionTitle,
  text,
  verse,
}) => {
  return (
    <div>
      <Hero
        title={heroTitle}
        postTitle={heroPostTitle}
        imgSrc={heroImgSrc}
        position={position}
      />
      <FluidContainer>
        <Verse verse={verse} continuation={continuation} text={text} />
        <Divider />
      </FluidContainer>
    </div>
  );
};
