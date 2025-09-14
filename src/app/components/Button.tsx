import Link from "next/link";
import React from "react";
import { Typography } from "./Typography";

interface ButtonProps {
  href?: string;
  title: string;
  variant?: "black" | "outline";
  onClick?: () => void;
}
export const Button: React.FC<ButtonProps> = ({
    href,
    title,
  variant = "standard",
  onClick
}) => {
  const classNames: { [key: string]: string } = {
    black: "py-2 px-4 rounded-md bg-black text-white hover:bg-accent-dark-green",
    outline: "py-2 px-4 rounded-md border-solid border-2 border-black text-black hover:bg-black hover:text-white",
    standard: "py-2 px-4 rounded-md bg-footer-dark-grey text-white hover:bg-accent-dark-green"
  };

  if (href) {
    return (
        <Link href={href} className={classNames[variant]} target="_blank">
            <Typography variant="button">{title}</Typography>
        </Link>
    )
  }
  return (
    <button type="button" className={classNames[variant]} onClick={onClick}>
      <Typography>{title}</Typography>
    </button>
  );
};
