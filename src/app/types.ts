import { ReactNode } from "react";

export interface GenericPageProps {
  children?: ReactNode;
  heroPostTitle?: string;
  heroTitle?: string;
  heroImgSrc?: string;
  position?: "center" | "top" | "left" | "right" | "bottom" | undefined;
  subSectionArray?: Array<Object>;
  subSectionTitle?: string;
}

export interface VerseProps {
  continuation?: boolean;
  text?: string;
  verse?: string;
}
