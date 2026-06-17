import Link from "next/link";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// tareka. wordmark components.
//
// ACCENT RULE:
//   text-accent-sage-ink resolves per CSS theme:
//     :root  (light / parchment) → #3F6B3A  — legible on parchment (~5.3:1)
//     .dark  (graphite shell)    → #A1C998  — legible on graphite (~10:1)
//   Use text-accent-sage-ink everywhere the "re" and "." appear.
//   DO NOT use text-accent-sage for text on light surfaces — it fails WCAG.
// ─────────────────────────────────────────────────────────────────────────────

/** Wordmark only — no link. Used in AppTopbar (dark nav chrome). */
export function BrandMark({
  className,
  "aria-label": ariaLabel = "tareka.",
}: {
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <span
      className={cn("font-heading text-lg font-semibold tracking-tight", className)}
      aria-label={ariaLabel}
    >
      <span className="text-nav-ink">ta</span>
      <span className="text-accent-sage-ink">re</span>
      <span className="text-nav-ink">ka</span>
      <span className="text-accent-sage-ink">.</span>
    </span>
  );
}

/** Full logo with link. variant="chrome" for dark nav; variant="default" for light surfaces. */
export function Logo({
  className,
  href = "/",
  variant = "default",
}: {
  className?: string;
  href?: string;
  variant?: "default" | "chrome";
}) {
  const ink = variant === "chrome" ? "text-nav-ink" : "text-foreground";
  return (
    <Link
      href={href}
      className={cn("font-heading text-lg font-semibold tracking-tight", className)}
      aria-label="tareka. home"
    >
      <span className={ink}>ta</span>
      <span className="text-accent-sage-ink">re</span>
      <span className={ink}>ka</span>
      <span className="text-accent-sage-ink">.</span>
    </Link>
  );
}