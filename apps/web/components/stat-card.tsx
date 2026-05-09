import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Card } from "./card";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  subdued?: boolean;
  className?: string;
}

export function StatCard({ label, value, hint, subdued, className }: StatCardProps) {
  return (
    <Card className={cn("p-4", subdued && "opacity-90", className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-dim">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-heading text-xl font-semibold tabular-nums tracking-tight text-foreground",
          subdued && "text-lg text-muted",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-dim">{hint}</p> : null}
    </Card>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse p-4", className)}>
      <div className="h-3 w-24 rounded bg-elevated" />
      <div className="mt-3 h-8 w-20 rounded bg-elevated" />
    </Card>
  );
}
