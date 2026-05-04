import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  leading?: ReactNode;
}

export function ActivityList({
  items,
  emptyLabel = "No activity yet.",
  className,
}: {
  items: ActivityItem[];
  emptyLabel?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-muted",
          className,
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-border rounded-lg border border-border bg-surface", className)}>
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 px-4 py-3">
          {item.leading ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-elevated text-xs text-muted">
              {item.leading}
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
            {item.subtitle ? (
              <p className="truncate text-xs text-muted">{item.subtitle}</p>
            ) : null}
          </div>
          {item.meta ? (
            <span className="shrink-0 text-xs tabular-nums text-muted">{item.meta}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
