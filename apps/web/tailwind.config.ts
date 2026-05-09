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
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-focus": "var(--surface-focus)",
        "surface-raised": "var(--surface-raised)",
        elevated: "var(--elevated)",
        "elevated-strong": "var(--elevated-strong)",
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
        },
        nav: {
          chrome: "var(--nav-chrome)",
          ink: "var(--nav-chrome-text)",
          muted: "var(--nav-chrome-muted)",
          line: "var(--nav-chrome-border)",
        },
        "map-glow": "var(--map-glow-blue-sage)",
        "dark-base": "var(--background-dark-neutral)",
        "dark-surface": "var(--surface-dark-neutral)",
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
