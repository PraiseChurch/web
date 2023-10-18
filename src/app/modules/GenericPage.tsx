"use client";
import React, { useState } from "react";
import {
  Divider,
  FluidContainer,
  Hero,
  TextSubsection,
  Typography,
  Verse,
} from "../components";
import { GenericPageProps, SubsectionObjectProps, VerseProps } from "../types";

interface CombinedProps extends GenericPageProps, VerseProps {};

export const GenericPage: React.FC<CombinedProps> = ({
  continuation,
  heroImgSrc,
  heroPostTitle,
  heroTitle,
  position,
  subsectionArray,
  text,
  verse,
}) => {
  const [subsections, setSubsection] = useState<SubsectionObjectProps[]>(subsectionArray as SubsectionObjectProps[]);

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
        {subsections?.map((s: SubsectionObjectProps) => {
          return (
            <TextSubsection key={s.subsectionTitle} title={s.subsectionTitle}>
              {s.subsectionText}
            </TextSubsection>
          );
        })}
      </FluidContainer>
    </div>
  );
};
