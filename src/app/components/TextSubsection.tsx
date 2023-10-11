import React, { ReactNode } from "react";
import { Typography } from "./Typography";

interface TextSubsectionProps {
  children: ReactNode;
  title?: string;
}

export const TextSubsection: React.FC<TextSubsectionProps> = ({
  children,
  title,
}) => {
  return (
    <div className="my-4 flex flex-col">
      <div className="my-2">
        <Typography variant="sectionSubheading">{title}</Typography>
      </div>
      <Typography>{children}</Typography>
    </div>
  );
};
