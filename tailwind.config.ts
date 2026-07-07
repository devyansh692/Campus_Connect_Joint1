import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0A66C2",
          hover: "#004182",
          light: "#EBF4FD",
        },
        primary: {
          DEFAULT: "#0A66C2",
          hover: "#004182",
        },
        ink: {
          DEFAULT: "#1D2226",
          soft: "#5E5E5E",
          900: "#1D2226",
          700: "#38434F",
          500: "#5E5E5E",
          300: "#B0B0B0",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "'Segoe UI'",
          "Roboto", "Helvetica", "Arial", "sans-serif",
        ],
      },
      borderRadius: {
        xl3: "1.5rem",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
        softer: "0 2px 8px rgba(0,0,0,0.06)",
        lift: "0 8px 24px rgba(0,0,0,0.16)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shake: "shake 0.3s ease-in-out",
        fadeSlide: "fadeSlide 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
