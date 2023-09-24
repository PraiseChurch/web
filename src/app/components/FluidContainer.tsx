// components/Container.tsx
import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

export const FluidContainer: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      {children}
    </div>
  );
};