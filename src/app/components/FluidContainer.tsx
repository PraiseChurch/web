import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

export const FluidContainer: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="container my-10 mx-auto py-3 px-5 max-w-screen-lg">
      {children}
    </div>
  );
};
