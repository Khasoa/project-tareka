"use client";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Network Map — Nairobi constellation.
//
// Node layout redesign: Nairobi sits at true centre (280, 190).
// The four regional cities are placed at varied distances and angles
// so the backbone forms an asymmetric star — closer to real geography
// and more visually interesting than a rectangle:
//
//   Kiambu   NW  ~120° bearing, ~110px
//   Thika    NE  ~050° bearing, ~135px
//   Ngong    SW  ~225° bearing, ~120px
//   Kitengela SE  ~155° bearing, ~130px
//
// Neighbourhood sites cluster around Nairobi at intermediate distances.
// ─────────────────────────────────────────────────────────────────────────────

const MAP_BG = "#0D0F10";
const SAGE    = "#A1C998";
const SAGE_LT = "#C2E0B8";

interface MapNode {
  id: string;
  x: number;
  y: number;
  label: string;
  tier: "city" | "site";
  materials: string[];
}

const NODES: MapNode[] = [
  // ── Hub ──────────────────────────────────────────────────────────────────
  { id: "nairobi",    x: 280, y: 195, label: "Nairobi",    tier: "city",
    materials: ["Plastic","Glass","Electronics","Metal","Paper","Textiles"] },

  // ── Regional cities — varied angles & distances ───────────────────────────
  // Kiambu: NNW, ~110 px
  { id: "kiambu",    x: 170, y:  90, label: "Kiambu",    tier: "city",
    materials: ["Plastic","Paper","Textiles"] },
  // Thika: NNE, ~145 px (further — real distance is greater)
  { id: "thika",     x: 400, y:  65, label: "Thika",     tier: "city",
    materials: ["Metal","Electronics","Plastic"] },
  // Ngong: WSW, ~130 px
  { id: "ngong",     x: 115, y: 285, label: "Ngong",     tier: "city",
    materials: ["Glass","Paper","Textiles"] },
  // Kitengela: SSE, ~140 px
  { id: "kitengela", x: 385, y: 315, label: "Kitengela", tier: "city",
    materials: ["Plastic","Metal","Glass"] },

  // ── Inner neighbourhood sites — orbit Nairobi at 60-90 px ────────────────
  { id: "westlands", x: 192, y: 135, label: "Westlands",  tier: "site",
    materials: ["Plastic","Glass","Electronics"] },
  { id: "kilimani",  x: 210, y: 230, label: "Kilimani",   tier: "site",
    materials: ["Glass","Paper"] },
  { id: "lavington", x: 170, y: 270, label: "Lavington",  tier: "site",
    materials: ["Textiles","Paper"] },
  { id: "karen",     x: 175, y: 325, label: "Karen",      tier: "site",
    materials: ["Electronics","Textiles"] },
  { id: "eastleigh", x: 360, y: 140, label: "Eastleigh",  tier: "site",
    materials: ["Metal","Plastic"] },
  { id: "kasarani",  x: 358, y:  98, label: "Kasarani",   tier: "site",
    materials: ["Plastic","Paper"] },
  { id: "roysambu",  x: 308, y: 108, label: "Roysambu",   tier: "site",
    materials: ["Plastic","Glass"] },
  { id: "donholm",   x: 420, y: 200, label: "Donholm",    tier: "site",
    materials: ["Electronics"] },
  { id: "embakasi",  x: 448, y: 252, label: "Embakasi",   tier: "site",
    materials: ["Metal","Plastic"] },
  { id: "southb",    x: 328, y: 275, label: "South B",    tier: "site",
    materials: ["Plastic"] },
  { id: "langata",   x: 242, y: 308, label: "Lang'ata",   tier: "site",
    materials: ["Glass","Textiles"] },
  { id: "ruiru",     x: 448, y:  88, label: "Ruiru",      tier: "site",
    materials: ["Plastic","Paper"] },
];

// Ambient "stars" — scattered beyond the main cluster
const AMBIENT: { x: number; y: number; r: number; o: number }[] = [
  { x: 510, y: 80,  r: 1.2, o: 0.10 },
  { x: 530, y: 200, r: 0.9, o: 0.07 },
  { x: 505, y: 300, r: 1.0, o: 0.09 },
  { x: 50,  y: 55,  r: 1.1, o: 0.08 },
  { x: 30,  y: 160, r: 0.8, o: 0.06 },
  { x: 60,  y: 335, r: 1.0, o: 0.08 },
  { x: 480, y: 50,  r: 0.7, o: 0.06 },
  { x: 80,  y: 380, r: 0.9, o: 0.07 },
  { x: 320, y: 360, r: 1.1, o: 0.09 },
  { x: 160, y: 370, r: 0.8, o: 0.06 },
  { x: 22,  y: 90,  r: 1.0, o: 0.08 },
  { x: 545, y: 140, r: 0.7, o: 0.05 },
];

// Backbone + selective spokes (no dense mesh — keeps the star legible)
const EDGES: [string, string][] = [
  // City backbone
  ["nairobi",   "kiambu"],
  ["nairobi",   "thika"],
  ["nairobi",   "ngong"],
  ["nairobi",   "kitengela"],
  ["kiambu",    "thika"],
  ["thika",     "kitengela"],
  ["ngong",     "kitengela"],

  // Nairobi hub spokes to inner sites
  ["nairobi",   "westlands"],
  ["nairobi",   "kilimani"],
  ["nairobi",   "eastleigh"],
  ["nairobi",   "roysambu"],
  ["nairobi",   "southb"],
  ["nairobi",   "lavington"],

  // Regional city connections to nearby sites
  ["kiambu",    "westlands"],
  ["kiambu",    "kasarani"],
  ["thika",     "kasarani"],
  ["thika",     "ruiru"],
  ["thika",     "eastleigh"],
  ["ngong",     "lavington"],
  ["ngong",     "karen"],
  ["kitengela", "southb"],
  ["kitengela", "embakasi"],
  ["kitengela", "langata"],

  // Inner site cross-links (sparse — only legible pairs)
  ["westlands", "roysambu"],
  ["eastleigh", "donholm"],
  ["donholm",   "embakasi"],
  ["kilimani",  "langata"],
  ["karen",     "langata"],
];

function getNode(id: string): MapNode | undefined {
  return NODES.find((n) => n.id === id);
}

function nodeVisible(node: MapNode, activeMaterial: string): boolean {
  return activeMaterial === "All materials" || node.materials.includes(activeMaterial);
}

interface NetworkMapProps {
  className?: string;
  activeMaterial?: string;
}

export function NetworkMap({ className, activeMaterial = "All materials" }: NetworkMapProps) {
  const nairobi = getNode("nairobi")!;
  const regionalCities = ["kiambu", "thika", "ngong", "kitengela"];

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}
      style={{ background: MAP_BG }}>
      <svg
        viewBox="0 0 560 400"
        className="h-full w-full"
        role="img"
        aria-label="Illustrative constellation map of Nairobi-region collection network"
      >
        <defs>
          {/* Edge-to-edge vignette */}
          <radialGradient id="nmap-vignette" cx="50%" cy="50%" r="55%">
            <stop offset="20%" stopColor={MAP_BG} stopOpacity="0" />
            <stop offset="100%" stopColor={MAP_BG} stopOpacity="0.94" />
          </radialGradient>

          {/* Nairobi haze — large soft bloom */}
          <radialGradient id="nmap-hub-bloom"
            cx={nairobi.x} cy={nairobi.y} r="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={SAGE} stopOpacity="0.16" />
            <stop offset="35%"  stopColor={SAGE} stopOpacity="0.08" />
            <stop offset="65%"  stopColor={SAGE} stopOpacity="0.03" />
            <stop offset="100%" stopColor={SAGE} stopOpacity="0" />
          </radialGradient>

          {/* Fork blur — wide soft glow under backbone lines */}
          <filter id="nmap-fork-blur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge><feMergeNode in="blur" /></feMerge>
          </filter>

          {/* City node glow */}
          <filter id="nmap-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Nairobi — stronger dedicated glow */}
          <filter id="nmap-glow-nb" x="-160%" y="-160%" width="420%" height="420%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base fill */}
        <rect width="560" height="400" fill={MAP_BG} />

        {/* Hub bloom */}
        <ellipse
          cx={nairobi.x} cy={nairobi.y}
          rx="170" ry="155"
          fill="url(#nmap-hub-bloom)"
        />

        {/* Ambient star field */}
        {AMBIENT.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={SAGE} opacity={d.o} />
        ))}

        {/* ── Fork glow — wide blurred lines under the backbone ── */}
        <g filter="url(#nmap-fork-blur)" aria-hidden>
          {regionalCities.map((id) => {
            const node = getNode(id);
            if (!node) return null;
            const vis = nodeVisible(node, activeMaterial);
            return (
              <line
                key={`fork-${id}`}
                x1={nairobi.x} y1={nairobi.y}
                x2={node.x} y2={node.y}
                stroke={SAGE_LT}
                strokeWidth="12"
                strokeLinecap="round"
                opacity={vis ? 0.30 : 0.04}
                style={{ transition: "opacity 0.4s" }}
              />
            );
          })}
        </g>

        {/* ── Edges ── */}
        {EDGES.map(([a, b]) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;
          const visA = nodeVisible(na, activeMaterial);
          const visB = nodeVisible(nb, activeMaterial);
          const eitherVis = visA || visB;
          const bothCity = na.tier === "city" && nb.tier === "city";
          const hubSpoke = na.id === "nairobi" || nb.id === "nairobi";

          let opacity: number, stroke: string, width: number;

          if (!eitherVis) {
            opacity = 0.06; stroke = "#3a3a3a"; width = 0.5;
          } else if (bothCity) {
            opacity = 0.55; stroke = SAGE; width = 1.4;
          } else if (hubSpoke) {
            opacity = 0.20; stroke = "#868686"; width = 0.80;
          } else {
            opacity = 0.13; stroke = "#5a5a5a"; width = 0.55;
          }

          return (
            <line key={`${a}-${b}`}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={stroke} strokeWidth={width} opacity={opacity}
              style={{ transition: "opacity 0.4s" }}
            />
          );
        })}

        {/* ── Animated flow on city backbone ── */}
        {EDGES.map(([a, b]) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;
          if (na.tier !== "city" || nb.tier !== "city") return null;
          if (!nodeVisible(na, activeMaterial) || !nodeVisible(nb, activeMaterial)) return null;
          return (
            <line key={`flow-${a}-${b}`}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={SAGE} strokeWidth="1.6" opacity="0.35"
              className="nmap-route-flow"
            />
          );
        })}

        {/* ── Site-tier nodes ── */}
        {NODES.filter((n) => n.tier === "site").map((node) => (
          <circle key={node.id}
            cx={node.x} cy={node.y} r="2.4"
            fill="#5e5e5e"
            opacity={nodeVisible(node, activeMaterial) ? "0.85" : "0.08"}
            style={{ transition: "opacity 0.4s" }}
          />
        ))}

        {/* ── City-tier nodes with pulsing rings ── */}
        {NODES.filter((n) => n.tier === "city").map((node) => {
          const visible = nodeVisible(node, activeMaterial);
          const isNairobi = node.id === "nairobi";
          return (
            <g key={node.id}
              filter={visible ? (isNairobi ? "url(#nmap-glow-nb)" : "url(#nmap-glow)") : undefined}
              opacity={visible ? "1" : "0.07"}
              style={{ transition: "opacity 0.4s" }}>

              {isNairobi && (
                <>
                  {/* Outer static rings for stellar magnitude */}
                  <circle cx={node.x} cy={node.y} r="32" fill="none"
                    stroke={SAGE} strokeWidth="0.4" opacity="0.12" />
                  <circle cx={node.x} cy={node.y} r="24" fill="none"
                    stroke={SAGE} strokeWidth="0.45" opacity="0.18" />
                </>
              )}

              {/* Animated outer ring */}
              <circle cx={node.x} cy={node.y}
                r={isNairobi ? 16 : 11}
                fill="none"
                stroke={isNairobi ? SAGE : "#7a7d7a"}
                strokeWidth="0.7"
                className="nmap-outer-pulse"
              />
              {/* Animated mid ring */}
              <circle cx={node.x} cy={node.y}
                r={isNairobi ? 8 : 5.5}
                fill="none"
                stroke={isNairobi ? SAGE_LT : "#8f9190"}
                strokeWidth="0.9"
                className="nmap-mid-pulse"
              />
              {/* Core dot */}
              <circle cx={node.x} cy={node.y}
                r={isNairobi ? 3.8 : 2.6}
                fill={isNairobi ? SAGE_LT : "#9a9c9a"}
                className="nmap-core-pulse"
              />

              {/* Label */}
              <text
                x={node.x}
                y={node.y - (isNairobi ? 22 : 17)}
                textAnchor="middle"
                fontSize={isNairobi ? "9.5" : "7.5"}
                fill={isNairobi ? SAGE : "#a9aea5"}
                opacity={isNairobi ? "0.95" : "0.72"}
                fontFamily="system-ui, sans-serif"
                fontWeight="500"
                letterSpacing="0.03em"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Vignette last */}
        <rect width="560" height="400" fill="url(#nmap-vignette)" />
      </svg>
    </div>
  );
}