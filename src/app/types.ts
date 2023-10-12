import { ReactNode } from "react";

export interface GenericPageProps {
  children?: ReactNode;
  heroPostTitle?: string;
  heroTitle?: string;
  heroImgSrc?: string;
  position?: "center" | "top" | "left" | "right" | "bottom" | undefined;
  subsectionArray?: Array<Object>;
  subsectionChildren?: string;
  subsectionTitle?: string;
};

export interface SubsectionObjectProps {
  subsectionText: string;
  subsectionTitle: string;
};

export interface VerseProps {
  continuation?: boolean;
  text?: string;
  verse?: string;
};
