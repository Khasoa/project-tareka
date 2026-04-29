import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        olive: "var(--olive)",
        stone: "var(--stone)",
        linen: "var(--linen)",
        gold: "var(--gold)",
        brick: "var(--brick)",
        cyan: "var(--cyan)",
        fog: "var(--fog)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "sans-serif"],
        heading: ["var(--font-heading)", "Sora", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
