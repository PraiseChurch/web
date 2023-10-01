import React, { ReactNode } from "react";
import { Typography } from "./Typography";

interface TextSubsectionProps {
  children: ReactNode;
  title?: string;
}

export const TextSubsection: React.FC<TextSubsectionProps> = ({ children, title }) => {
  return (
    <div className="my-4 flex flex-col">
      <Typography variant="sectionSubheading">{title}</Typography>
      <Typography>
        {children}
      </Typography>
    </div>
  );
};
