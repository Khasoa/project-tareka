import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Network Map v4 — Constellation
//
// Visual language: distributed environmental intelligence, not routing paths.
// Three edge tiers at dramatically different opacities create a star-chart
// depth effect. Ambient dots provide the "stars between constellations" fill.
// Nairobi is the central anchor with a triple-ring signature.
// ─────────────────────────────────────────────────────────────────────────────

interface MapNode {
  id: string;
  x: number;
  y: number;
  label: string;
  tier: "city" | "site";
  materials: string[];
}

const NODES: MapNode[] = [
  // ── City anchors ──
  { id: "nairobi",   x: 268, y: 168, label: "Nairobi",   tier: "city", materials: ["Plastic","Glass","Electronics","Metal","Paper","Textiles"] },
  { id: "kiambu",    x: 232, y: 52,  label: "Kiambu",    tier: "city", materials: ["Plastic","Paper","Textiles"] },
  { id: "thika",     x: 375, y: 35,  label: "Thika",     tier: "city", materials: ["Metal","Electronics","Plastic"] },
  { id: "ngong",     x: 88,  y: 272, label: "Ngong",     tier: "city", materials: ["Glass","Paper","Textiles"] },
  { id: "kitengela", x: 360, y: 308, label: "Kitengela", tier: "city", materials: ["Plastic","Metal","Glass"] },

  // ── Neighbourhood sites ──
  { id: "westlands", x: 168, y: 118, label: "Westlands",  tier: "site", materials: ["Plastic","Glass","Electronics"] },
  { id: "kilimani",  x: 198, y: 205, label: "Kilimani",   tier: "site", materials: ["Glass","Paper"] },
  { id: "lavington", x: 135, y: 242, label: "Lavington",  tier: "site", materials: ["Textiles","Paper"] },
  { id: "karen",     x: 108, y: 310, label: "Karen",      tier: "site", materials: ["Electronics","Textiles"] },
  { id: "eastleigh", x: 368, y: 145, label: "Eastleigh",  tier: "site", materials: ["Metal","Plastic"] },
  { id: "kasarani",  x: 382, y: 62,  label: "Kasarani",   tier: "site", materials: ["Plastic","Paper"] },
  { id: "roysambu",  x: 298, y: 82,  label: "Roysambu",   tier: "site", materials: ["Plastic","Glass"] },
  { id: "donholm",   x: 425, y: 175, label: "Donholm",    tier: "site", materials: ["Electronics"] },
  { id: "embakasi",  x: 458, y: 242, label: "Embakasi",   tier: "site", materials: ["Metal","Plastic"] },
  { id: "southb",    x: 318, y: 278, label: "South B",    tier: "site", materials: ["Plastic"] },
  { id: "langata",   x: 225, y: 308, label: "Lang'ata",   tier: "site", materials: ["Glass","Textiles"] },
  { id: "ruiru",     x: 438, y: 80,  label: "Ruiru",      tier: "site", materials: ["Plastic","Paper"] },
];

// Ambient constellation dots — faint background "stars" with no data role
const AMBIENT_DOTS: { x: number; y: number }[] = [
  { x: 492, y: 108 }, { x: 512, y: 268 },
  { x: 42,  y: 78  }, { x: 58,  y: 322 },
  { x: 462, y: 40  }, { x: 20,  y: 188 },
  { x: 315, y: 345 }, { x: 152, y: 352 },
  { x: 534, y: 160 }, { x: 30,  y: 130 },
];

// ── Edge definitions ──
// city-city  → flowing animated lines (constellation backbone)
// city-site  → medium spokes
// site-site  → faint triangulation mesh (the "constellation web")
const EDGES: [string, string][] = [
  // City backbone — 6 triangulated connections
  ["nairobi",   "kiambu"],
  ["nairobi",   "ngong"],
  ["nairobi",   "kitengela"],
  ["kiambu",    "thika"],
  ["thika",     "kitengela"],   // long NE→SE diagonal
  ["ngong",     "kitengela"],   // southern arc

  // City-to-site spokes
  ["nairobi",   "westlands"],
  ["nairobi",   "kilimani"],
  ["nairobi",   "eastleigh"],
  ["nairobi",   "roysambu"],
  ["nairobi",   "southb"],
  ["kiambu",    "kasarani"],
  ["kiambu",    "westlands"],
  ["thika",     "kasarani"],
  ["thika",     "ruiru"],
  ["ngong",     "lavington"],
  ["ngong",     "karen"],
  ["kitengela", "embakasi"],
  ["kitengela", "southb"],
  ["kitengela", "langata"],

  // Site-site triangulation mesh
  ["westlands", "roysambu"],
  ["westlands", "kilimani"],
  ["roysambu",  "eastleigh"],
  ["roysambu",  "kasarani"],
  ["eastleigh", "donholm"],
  ["eastleigh", "kasarani"],
  ["kasarani",  "ruiru"],
  ["donholm",   "embakasi"],
  ["kilimani",  "lavington"],
  ["kilimani",  "southb"],
  ["kilimani",  "langata"],
  ["lavington", "karen"],
  ["karen",     "langata"],
  ["langata",   "southb"],
  ["southb",    "embakasi"],
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
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-background", className)}>
      <svg
        viewBox="0 0 560 360"
        className="h-full w-full"
        role="img"
        aria-label="Illustrative constellation map of Nairobi-region collection network"
      >
        <defs>
          <pattern id="nmap-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" strokeWidth="0.45" />
          </pattern>

          {/* Edge-to-edge vignette */}
          <radialGradient id="nmap-vignette" cx="50%" cy="50%" r="60%">
            <stop offset="10%" stopColor="#111111" stopOpacity="0" />
            <stop offset="100%" stopColor="#111111" stopOpacity="0.92" />
          </radialGradient>

          {/* Soft blue-sage focal bloom — map-only glow */}
          <radialGradient id="nmap-nairobi-haze" cx="268" cy="168" r="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#A7C7C4" stopOpacity="0.08" />
            <stop offset="45%"  stopColor="#8FB2AE" stopOpacity="0.05" />
            <stop offset="70%"  stopColor="#8FB2AE" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#8FB2AE" stopOpacity="0"    />
          </radialGradient>

          {/* City node glow filter */}
          <filter id="nmap-glow" x="-110%" y="-110%" width="320%" height="320%">
            <feGaussianBlur stdDeviation="7.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Nairobi — stronger dedicated glow */}
          <filter id="nmap-glow-nb" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid */}
        <rect width="560" height="360" fill="url(#nmap-grid)" opacity="0.70" />

        {/* Nairobi environmental haze */}
        <rect width="560" height="360" fill="url(#nmap-nairobi-haze)" />

        {/* Ambient constellation dots — always visible, no filtering */}
        {AMBIENT_DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1" fill="#9FBFBC" opacity="0.09" />
        ))}

        {/* Edges — three visual tiers */}
        {EDGES.map(([a, b]) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;

          const visA = nodeVisible(na, activeMaterial);
          const visB = nodeVisible(nb, activeMaterial);
          const eitherVisible = visA || visB;
          const bothCity  = na.tier === "city" && nb.tier === "city";
          const bothSite  = na.tier === "site" && nb.tier === "site";

          // Opacity tiers: backbone > spoke > mesh
          let baseOpacity: number;
          let stroke: string;
          let strokeWidth: number;

          if (!eitherVisible) {
            baseOpacity = 0.07;
            stroke = "#3a3a3a";
            strokeWidth = 0.5;
          } else if (bothCity) {
            baseOpacity = 0.34;
            stroke = "#A7ADA2";
            strokeWidth = 1.3;
          } else if (bothSite) {
            baseOpacity = 0.14;
            stroke = "#4d4d4d";
            strokeWidth = 0.55;
          } else {
            // city-site spoke
            baseOpacity = 0.22;
            stroke = "#6b6b6b";
            strokeWidth = 0.75;
          }

          return (
            <line
              key={`${a}-${b}`}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={baseOpacity}
              style={{ transition: "opacity 0.4s" }}
            />
          );
        })}

        {/* Flowing animated overlay — city-to-city backbone only */}
        {EDGES.map(([a, b]) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;
          if (na.tier !== "city" || nb.tier !== "city") return null;
          const visible = nodeVisible(na, activeMaterial) && nodeVisible(nb, activeMaterial);
          if (!visible) return null;
          return (
            <line
              key={`flow-${a}-${b}`}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke="#9FBFBC"
              strokeWidth="1.5"
              opacity="0.22"
              className="nmap-route-flow"
            />
          );
        })}

        {/* Site-tier nodes */}
        {NODES.filter((n) => n.tier === "site").map((node) => {
          const visible = nodeVisible(node, activeMaterial);
          return (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r="2.2"
              fill="#5a5a5a"
              opacity={visible ? "0.80" : "0.08"}
              style={{ transition: "opacity 0.4s" }}
            />
          );
        })}

        {/* City-tier nodes — breathing rings */}
        {NODES.filter((n) => n.tier === "city").map((node) => {
          const visible = nodeVisible(node, activeMaterial);
          const isNairobi = node.id === "nairobi";

          return (
            <g
              key={node.id}
              filter={visible ? (isNairobi ? "url(#nmap-glow-nb)" : "url(#nmap-glow)") : undefined}
              opacity={visible ? "1" : "0.08"}
              style={{ transition: "opacity 0.4s" }}
            >
              {/* Nairobi only: extra outermost static ring for stellar magnitude */}
              {isNairobi && (
                <circle cx={node.x} cy={node.y} r="22" fill="none" stroke="#A7C7C4" strokeWidth="0.4" opacity="0.12" />
              )}
              {/* Outer animated ring */}
              <circle cx={node.x} cy={node.y} r={isNairobi ? 14 : 13} fill="none" stroke={isNairobi ? "#9FBFBC" : "#8a8d8a"} strokeWidth="0.6" className="nmap-outer-pulse" />
              {/* Mid animated ring */}
              <circle cx={node.x} cy={node.y} r={isNairobi ? 7 : 6}  fill="none" stroke={isNairobi ? "#A7C7C4" : "#8f9190"} strokeWidth="0.9" className="nmap-mid-pulse" />
              {/* Core dot */}
              <circle cx={node.x} cy={node.y} r={isNairobi ? 3.5 : 2.8} fill={isNairobi ? "#8FB2AE" : "#9a9c9a"} className="nmap-core-pulse" />
              <text
                x={node.x}
                y={node.y - (isNairobi ? 20 : 18)}
                textAnchor="middle"
                fontSize={isNairobi ? "9" : "8"}
                fill={isNairobi ? "#9FBFBC" : "#a9aea5"}
                opacity={isNairobi ? "0.88" : "0.75"}
                fontFamily="system-ui, sans-serif"
                fontWeight="500"
                letterSpacing="0.025em"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Vignette — rendered last */}
        <rect width="560" height="360" fill="url(#nmap-vignette)" />
      </svg>
    </div>
  );
}
