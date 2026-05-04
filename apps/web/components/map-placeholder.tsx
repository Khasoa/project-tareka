import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function MapPlaceholder({
  className,
  label = "Map preview",
  ...props
}: HTMLAttributes<HTMLDivElement> & { label?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/50 text-center",
        className,
      )}
      {...props}
    >
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 max-w-xs px-4 text-xs text-muted">
        Live routing and pins connect to your location-aware directory API when enabled.
      </p>
    </div>
  );
}
