import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

export const FluidContainer: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="container mx-auto py-3 px-4 flex max-w-screen-lg">
      {children}
    </div>
  );
};
