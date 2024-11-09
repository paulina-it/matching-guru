import type { Config } from "tailwindcss";

const colors = require("tailwindcss/colors");

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "15px",
    },
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    fontFamily: {
      primary: "var(--font-mulish)",
      accent: "var(--font-playfairDisplay)",
      mulish: ["Mulish", "sans-serif"],
      playfair: ["Playfair Display", "serif"],
    },
    colors: {
      ...colors,
	  light: "#E8E8E8",
	  dark: "#1A1A1A",
	  primary: {
		DEFAULT: "#2C3E50",
		hover: "#243746",
		dark: "#1B2732",
	  },
	  secondary: {
		DEFAULT: "#5A8DA0",
		hover: "#4A7687",
		dark: "#3A5F6B",
	  },
	  accent: {
		DEFAULT: "#4F6B66",
		hover: "#3F5652",
		dark: "#2E413D",
	  },
	  highlight: {
		DEFAULT: "#B89A5E",
		hover: "#967E4D",
		dark: "#705D3B",
	  },
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
