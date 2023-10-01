import React, { ReactNode } from "react";
import { Typography } from "./Typography";

interface TextSubsectionProps {
  children: ReactNode;
  heading?: string;
}

export const TextSubsection: React.FC<TextSubsectionProps> = ({ children, heading }) => {
  return (
    <div className="my-4 flex flex-col">
      <Typography variant="sectionSubheading">{heading}</Typography>
      <Typography>
        {children}
      </Typography>
    </div>
  );
};
