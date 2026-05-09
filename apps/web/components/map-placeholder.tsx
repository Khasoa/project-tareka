import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { DirectoryNetworkPanel } from "./directory-network-panel";

export function MapPlaceholder({
  className,
  label = "Map preview",
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  label?: string;
  /** `network` — constellation / telemetry panel (directory-aligned). */
  variant?: "default" | "network";
}) {
  if (variant === "network") {
    return (
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        <DirectoryNetworkPanel className="w-full flex-1" />
        <p className="text-[10px] leading-snug text-dim">
          Illustrative network — not live GPS.{" "}
          <span className="text-secondary">{label}</span>
        </p>
      </div>
    );
  }

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
