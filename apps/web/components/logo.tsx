import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  tone = "default",
}: {
  className?: string;
  href?: string;
  tone?: "default" | "chrome";
}) {
  return (
    <Link
      href={href}
      className={cn("font-heading text-lg font-semibold tracking-tight", className)}
      aria-label="tareka home"
    >
      <span className={tone === "chrome" ? "text-nav-ink/75" : "text-muted"}>tare</span>
      <span className="text-accent-cyan">ka</span>
    </Link>
  );
}
