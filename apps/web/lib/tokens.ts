export const tarekaTokens = {
  colors: {
    olive: "#171B18",
    stone: "#242926",
    linen: "#F0EBDD",
    gold: "#D9A13A",
    brick: "#B96A48",
    cyan: "#62A8B7",
    fog: "#8A8F8A",
  },
  semantic: {
    background: "var(--olive)",
    card: "var(--stone)",
    foreground: "var(--linen)",
    accent: "var(--gold)",
    alert: "var(--brick)",
    metric: "var(--cyan)",
    muted: "var(--fog)",
  },
  gradients: {
    midnightEmerald: "linear-gradient(180deg, #111614 0%, #171B18 100%)",
    premiumHighlight: "linear-gradient(90deg, #D9A13A 0%, #62A8B7 100%)",
  },
} as const;

export type TarekaTokens = typeof tarekaTokens;
