import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        olive: "var(--olive)",
        stone: "var(--stone)",
        linen: "var(--linen)",
        gold: "var(--gold)",
        brick: "var(--brick)",
        cyan: "var(--cyan)",
        fog: "var(--fog)",
      },
    },
  },
};

export default preset;
