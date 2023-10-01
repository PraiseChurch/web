import React, { ReactNode } from "react";

interface PageProps {
  children: ReactNode;
}
export const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-screen-lg mx-auto flex-grow p-4">{children}</div>
    </div>
  );
};
