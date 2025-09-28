import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF"
        },
        accent: {
          DEFAULT: "#14B8A6",
          foreground: "#0F172A"
        },
        danger: {
          DEFAULT: "#DC2626",
          foreground: "#FEF2F2"
        }
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" }
        }
      },
      animation: {
        shimmer: "shimmer 1.5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
