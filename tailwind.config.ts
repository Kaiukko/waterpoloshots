import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0e",
        surface: "#121218",
        "surface-2": "#181820",
        "surface-3": "#1e1e28",
        border: "#26262f",
        "border-soft": "#1c1c24",
        "on-surface": "#ffffff",
        muted: "#8b8b96",
        "muted-2": "#c2c2ca",
        primary: "var(--color-primary, #e5142b)",
        "primary-soft": "var(--color-primary-soft, rgba(229, 20, 43, 0.14))",
        "on-primary": "#ffffff",
        secondary: "var(--color-secondary, #f0b429)",
        "secondary-soft": "var(--color-secondary-soft, rgba(240, 180, 41, 0.14))",
        "on-secondary": "#1a1305",
        // Alias di compatibilità verso nomi usati in alcuni componenti più vecchi
        gold: "var(--color-secondary, #f0b429)",
        line: "#26262f",
        base: "#0a0a0e",
        surface2: "#181820",
        outline: "#8b8b96",
        "on-surface-variant": "#c2c2ca",
      },
      borderRadius: {
        DEFAULT: "14px",
        none: "0px",
        sm: "8px",
        md: "12px",
        lg: "14px",
        xl: "18px",
        "2xl": "20px",
        "3xl": "24px",
        full: "9999px",
      },
      fontFamily: {
        display: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
