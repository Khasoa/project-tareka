import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Directory / site context — infrastructural network view. Blue-sage glow lives
 * only inside this SVG (map telemetry), per design system.
 */
export function DirectoryNetworkPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-xl border border-border bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
      role="img"
      aria-label="Illustrative network map of collection sites"
      {...props}
    >
      <svg
        viewBox="0 0 400 520"
        className="h-full w-full min-h-[280px] max-h-[min(72vh,560px)]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="dir-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A7C7C4" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#8FB2AE" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#8FB2AE" stopOpacity="0" />
          </radialGradient>
          <filter id="dir-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="400" height="520" fill="#121212" />
        {/* Perspective grid */}
        <g opacity="0.45">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={60 + i * 58}
              x2="400"
              y2={40 + i * 54}
              stroke="#2a2a2a"
              strokeWidth="0.55"
            />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line
              key={`v-${i}`}
              x1={20 + i * 46}
              y1="0"
              x2={-30 + i * 52}
              y2="520"
              stroke="#2a2a2a"
              strokeWidth="0.45"
            />
          ))}
        </g>

        {/* Route shimmer */}
        <path
          d="M48 380 Q120 300 180 340 T280 220 Q320 180 360 140"
          fill="none"
          stroke="#8FB2AE"
          strokeWidth="1.2"
          strokeOpacity="0.28"
          strokeLinecap="round"
          strokeDasharray="5 11"
        />
        <path
          d="M70 420 L160 360 L240 280 L320 200"
          fill="none"
          stroke="#9FBFBC"
          strokeWidth="0.9"
          strokeOpacity="0.18"
          strokeLinecap="round"
        />

        {/* Nodes — trusted (glow), community (muted) */}
        {[
          { x: 280, y: 200, trusted: true },
          { x: 160, y: 360, trusted: true },
          { x: 100, y: 240, trusted: false },
          { x: 220, y: 300, trusted: false },
          { x: 310, y: 320, trusted: true },
          { x: 60, y: 400, trusted: false },
          { x: 340, y: 420, trusted: false },
          { x: 180, y: 150, trusted: true },
        ].map((n, i) => (
          <g key={i}>
            {n.trusted ? (
              <circle cx={n.x} cy={n.y} r="14" fill="url(#dir-node-glow)" opacity="0.85" />
            ) : null}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.trusted ? 4 : 3}
              fill={n.trusted ? "#8FB2AE" : "#6a6d6a"}
              fillOpacity={n.trusted ? 0.9 : 0.55}
              filter={n.trusted ? "url(#dir-soft-glow)" : undefined}
            />
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-border/80 bg-[#1C1C1C]/92 px-2.5 py-2 text-left shadow-lg backdrop-blur-sm">
        <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-dim">Legend</p>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-secondary">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#8FB2AE]" aria-hidden />
          Trusted partner
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-secondary">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#6a6d6a]" aria-hidden />
          Community site
        </div>
      </div>
    </div>
  );
}
