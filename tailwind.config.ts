import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "accent-blue": "#535693",
        "accent-dark-blue": "#0331C6",
        "accent-light-blue": "#1540F9",
        "accent-dark-green": "#004957",
        "accent-darker-green": "#033946",
        "accent-green": "#016673",
        "accent-light-green": "#3B9C9F",
        "footer-grey": "#333333",
        "footer-dark-grey": "#1F1F1F",
      },
      fontFamily: {
        serif: "var(--font-arvo)",
        "sans-serif": "var(--font-lato)",
      },
      letterSpacing: {
        widester: ".25em",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
};
export default config;
