import { cn } from "@/lib/utils";

/** Compact operational motif — route spine + nodes, CSS/SVG only. */
export function DashboardAnchor({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-surface/80",
        className,
      )}
      role="img"
      aria-label="Verified collection route preview"
    >
      <svg
        className="h-[4.5rem] w-full text-foreground"
        viewBox="0 0 560 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M24 44h96l44-20h104l52 18h120l96-26"
          stroke="currentColor"
          strokeOpacity={0.14}
          strokeWidth={1.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 44h96l44-20h104l52 18h120l96-26"
          stroke="#A1C998"
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 10"
        />
        <circle cx="120" cy="44" r="3" fill="#A1C998" fillOpacity={0.55} />
        <circle cx="264" cy="24" r="2.5" fill="currentColor" fillOpacity={0.18} />
        <circle cx="376" cy="42" r="2.5" fill="currentColor" fillOpacity={0.14} />
        <circle cx="480" cy="22" r="3" fill="#A1C998" fillOpacity={0.4} />
        <rect x="14" y="54" width="532" height="1" fill="currentColor" fillOpacity={0.06} />
      </svg>
    </div>
  );
}
