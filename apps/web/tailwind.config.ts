import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        foreground: "var(--text-primary)",
        muted: "var(--text-secondary)",
        dim: "var(--text-dim)",
        border: "var(--border-subtle)",
        sage: {
          DEFAULT: "var(--accent-sage)",
          hover: "var(--accent-sage-hover)",
        },
        rose: {
          DEFAULT: "var(--accent-rose)",
        },
        accent: {
          sage: "var(--accent-sage)",
          "sage-hover": "var(--accent-sage-hover)",
          rose: "var(--accent-rose)",
          amber: "var(--accent-amber)",
          cyan: "var(--accent-cyan)",
          "cyan-deep": "var(--accent-cyan-deep)",
          mint: "var(--accent-mint-soft)",
          "mint-dim": "var(--accent-mint-dim)",
        },
        nav: {
          chrome: "var(--nav-chrome)",
          ink: "var(--nav-chrome-text)",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "sans-serif"],
        heading: ["Satoshi", "var(--font-heading)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
