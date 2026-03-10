import type { Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "node_modules/flowbite-react/lib/esm/**/*.js",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2f80ed",
          "primary-dark": "#1c64d8",
          "primary-darker": "#174ea6",
          dark: "#0f2a44",
          surface: "#f5f7fa",
          muted: "#d1e0f2",
          ink: "#1f2933",
          "ink-muted": "#52606d",
        },
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      boxShadow: {
        custom: "0px 4px 10px 0px #AEBBC940",
        "custom-card": "10px 10px 20px 10px #AEBBC940",
      },
      fontFamily: {
        sans: ["Gordita", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        spinner_y0fdc1: {
          "0%": {
            transform: "rotate(45deg) rotateX(-25deg) rotateY(25deg)",
          },
          "50%": {
            transform: " rotate(45deg) rotateX(-385deg) rotateY(25deg)",
          },

          "100%": {
            transform: "rotate(45deg) rotateX(-385deg) rotateY(385deg)",
          },
        },
        "loader-icon-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "loader-icon-out": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-8px) scale(0.95)" },
        },
      },
      animation: {
        spinner: "spinner_y0fdc1 2s infinite ease",
        "icon-rotate-in": "loader-icon-in 0.35s ease-out forwards",
        "icon-rotate-out": "loader-icon-out 0.35s ease-in forwards",
      },
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(94.46deg, #F7C229 26.21%, #FFE391 61.51%, #FFBE00 104.18%)",
        "text-gradient":
          "linear-gradient(180deg, #4992FF 7.35%, #2C5899 138.24%)",
        "color-gradient":
          "linear-gradient(104.96deg, #E4EFFF 0%, #5C96ED 100%)",
      },
    },
  },
  important: true,
  variants: {
    extend: {},
  },
  plugins: [],
};
export default config;
