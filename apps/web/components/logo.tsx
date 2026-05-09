import Link from "next/link";

import { cn } from "@/lib/utils";

/** Wordmark only — no link. Use in app shell topbar (navigation is via sidebar). */
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
      <span className="text-accent-sage">re</span>
      <span className="text-nav-ink">ka.</span>
    </span>
  );
}

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
      <span className="text-accent-sage">re</span>
      <span className={ink}>ka.</span>
    </Link>
  );
}
