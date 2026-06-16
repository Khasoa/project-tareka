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
        background:        "var(--background)",
        canvas:            "var(--canvas)",
        surface:           "var(--surface)",
        "surface-focus":   "var(--surface-focus)",
        "surface-raised":  "var(--surface-raised)",
        elevated:          "var(--elevated)",
        "elevated-strong": "var(--elevated-strong)",
        foreground:        "var(--text-primary)",
        muted:             "var(--text-secondary)",
        dim:               "var(--text-dim)",
        border:            "var(--border-subtle)",
        sage: {
          DEFAULT: "var(--accent-sage)",
          hover:   "var(--accent-sage-hover)",
          ink:     "var(--accent-sage-ink)",
        },
        rose: {
          DEFAULT: "var(--accent-rose)",
        },
        accent: {
          sage:       "var(--accent-sage)",
          "sage-hover": "var(--accent-sage-hover)",
          "sage-ink": "var(--accent-sage-ink)",   /* ← NEW: use for accent TEXT */
          rose:       "var(--accent-rose)",
        },
        nav: {
          chrome: "var(--nav-chrome)",
          ink:    "var(--nav-chrome-text)",
          muted:  "var(--nav-chrome-muted)",
          line:   "var(--nav-chrome-border)",
        },
        /* map glow updated from blue-sage to Fresh sage */
        "map-glow":     "var(--map-glow-sage)",
        "dark-base":    "var(--background-dark-neutral)",
        "dark-surface": "var(--surface-dark-neutral)",
      },
      fontFamily: {
        sans:    ["var(--font-body)", "Inter", "sans-serif"],
        heading: ["Satoshi", "var(--font-heading)", "Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;