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
	  light: "#fefaf9",
	  dark: "#1A1A1A",
	  primary: {
		DEFAULT: "#9fcada",
		hover: "#549ab4",
		dark: "#25505f",
	  },
	  secondary: {
		DEFAULT: "#62a8d7",
		hover: "#2c7cb1",
		dark: "#296f9e",
	  },
	  accent: {
		DEFAULT: "#ba5648",
		hover: "#9a3325",
		dark: "#b55245",
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
