import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A0A0B",
        surface: "#141416",
        surface2: "#1C1C1F",
        line: "#2A2A2E",
        primary: "var(--color-primary, #E10600)",
        gold: "var(--color-secondary, #D4AF37)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        pulseSlow: "pulseSlow 2s ease-in-out infinite",
      },
      keyframes: {
        pulseSlow: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
