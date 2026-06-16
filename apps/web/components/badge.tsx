import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums",
  {
    variants: {
      variant: {
        default: "border-border bg-elevated text-muted",
        verified: "border-accent-sage/40 bg-accent-sage/10 text-accent-sage-ink",
        sage: "border-accent-sage/40 bg-accent-sage/10 text-accent-sage-ink",
        rose: "border-accent-rose/40 bg-accent-rose/10 text-accent-rose",
        outline: "border-border text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
