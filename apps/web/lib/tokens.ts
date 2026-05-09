export const tarekaTokens = {
  colors: {
    graphite: "#111111",
    panel: "#1C1C1C",
    parchment: "#F1EFE8",
    gold: "#D9A13A",
    brick: "#B96A48",
    sage: "#A8BFA6",
    fog: "#777D75",
  },
  semantic: {
    background: "var(--background)",
    card: "var(--surface)",
    foreground: "var(--text-primary)",
    accent: "var(--accent-sage)",
    alert: "var(--accent-rose)",
    metric: "var(--text-secondary)",
    muted: "var(--text-dim)",
  },
  gradients: {
    charcoalDepth: "linear-gradient(180deg, #111111 0%, #161615 100%)",
    warmLift: "linear-gradient(90deg, #E8E5DC 0%, #F8F7F2 100%)",
  },
} as const;

export type TarekaTokens = typeof tarekaTokens;
