import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("font-heading text-lg font-semibold tracking-tight", className)}
      aria-label="tareka home"
    >
      <span className="text-foreground">ta</span>
      <span className="text-accent-sage">re</span>
      <span className="text-foreground">ka.</span>
    </Link>
  );
}
