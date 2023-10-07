import { ReactNode } from "react";

export interface GenericPageProps {
  children?: ReactNode;
  heroTitle?: string;
  heroImgSrc?: string;
  position?: "center" | "top" | "left" | "right" | "bottom" | undefined;
}

export interface VerseProps {
  continuation: boolean;
  text: string;
  verse: string;
}
