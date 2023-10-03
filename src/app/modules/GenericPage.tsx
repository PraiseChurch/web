import React, { ReactNode } from "react";
import Image from "next/image";
import {
  Divider,
  FluidContainer,
  Hero,
  TextSubsection,
  Typography,
} from "../components";

interface GenericPageProps {
    children?: ReactNode;
    heroTitle?: string;
    heroImgSrc?: string;
}
export const GenericPage: React.FC<GenericPageProps> = ({heroImgSrc, heroTitle}) => {
    return (
        <div>
            <Hero title={heroTitle} imgSrc={heroImgSrc} />
        </div>
    )
}