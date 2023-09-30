import { Typography } from "../components";
import React from "react";

interface ButtonProps {
  href?: string;
  title: string;
  variant?: "black" | "outline";
}
export const Button: React.FC<ButtonProps> = ({
    href,
    title,
  variant = "standard"
}) => {
  const classNames: { [key: string]: string } = {
    black: "py-2 px-4 rounded-md bg-black text-white hover:bg-accent-blue",
    outline: "py-2 px-4 rounded-md border-black text-black hover:bg-black hover:text-white",
    standard: "py-2 px-4 rounded-md bg-footer-dark-grey text-white hover:bg-accent-blue"
  };

  if (href) {
    return (
        <a href={href} className={classNames[variant]}>
            <Typography>{title}</Typography>
        </a>
    )
  }
  return (
    <button type="button" className={classNames[variant]}>
      <Typography>{title}</Typography>
    </button>
  );
};
