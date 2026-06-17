"use client";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Network Map — Kenya constellation.
//
// Nairobi sits at centre (280, 198). Three regional hubs radiate as star arms:
//   Kiambu   N   — metro north corridor
//   Kisumu   W   — western Kenya
//   Mombasa  SE  — coastal corridor
//
// Inner neighbourhood sites cluster around Nairobi; north corridor links Kiambu.
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
  { id: "nairobi",    x: 280, y: 198, label: "Nairobi",    tier: "city",
    materials: ["Plastic","Glass","Electronics","Metal","Paper","Textiles"] },

  // ── Regional hubs — three star arms ─────────────────────────────────────────
  { id: "kiambu",   x: 255, y:  72, label: "Kiambu",   tier: "city",
    materials: ["Plastic", "Paper", "Textiles"] },
  { id: "kisumu",   x:  72, y: 205, label: "Kisumu",   tier: "city",
    materials: ["Glass", "Paper", "Metal"] },
  { id: "mombasa",  x: 460, y: 312, label: "Mombasa",  tier: "city",
    materials: ["Plastic", "Glass", "Metal"] },

  // ── Inner neighbourhood sites — orbit Nairobi ───────────────────────────
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

// Primary arms from Nairobi — the visible star shape
const STAR_ARMS: [string, string][] = [
  ["nairobi", "kiambu"],
  ["nairobi", "kisumu"],
  ["nairobi", "mombasa"],
];

// Secondary links (sites + sparse cross-links) — kept subtle so the star stays legible
const EDGES: [string, string][] = [
  ...STAR_ARMS,

  // Nairobi hub spokes to inner sites
  ["nairobi", "westlands"],
  ["nairobi", "kilimani"],
  ["nairobi", "eastleigh"],
  ["nairobi", "roysambu"],
  ["nairobi", "southb"],
  ["nairobi", "lavington"],

  // Regional corridor links — subtle; star arms remain primary
  ["kiambu", "westlands"],
  ["kiambu", "kasarani"],
  ["kiambu", "roysambu"],
  ["kiambu", "ruiru"],
  ["mombasa", "embakasi"],
  ["mombasa", "donholm"],

  // Inner site cross-links (sparse)
  ["westlands", "roysambu"],
  ["eastleigh", "donholm"],
  ["donholm", "embakasi"],
  ["kilimani", "langata"],
  ["karen", "langata"],
];

function isStarArm(a: string, b: string): boolean {
  return STAR_ARMS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

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

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}
      style={{ background: MAP_BG }}>
      <svg
        viewBox="0 0 560 400"
        className="h-full w-full"
        role="img"
        aria-label="Illustrative constellation map of Kenya collection network"
      >
        <defs>
          {/* Edge-to-edge vignette */}
          <radialGradient id="nmap-vignette" cx="50%" cy="50%" r="55%">
            <stop offset="20%" stopColor={MAP_BG} stopOpacity="0" />
            <stop offset="100%" stopColor={MAP_BG} stopOpacity="0.94" />
          </radialGradient>

          {/* Nairobi haze — tight stellar core */}
          <radialGradient id="nmap-hub-bloom"
            cx={nairobi.x} cy={nairobi.y} r="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={SAGE} stopOpacity="0.55" />
            <stop offset="45%"  stopColor={SAGE} stopOpacity="0.18" />
            <stop offset="100%" stopColor={SAGE} stopOpacity="0" />
          </radialGradient>

          {/* Star-arm bloom — tapered glow along each primary arm */}
          <radialGradient id="nmap-arm-bloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SAGE} stopOpacity="0.22" />
            <stop offset="55%" stopColor={SAGE} stopOpacity="0.06" />
            <stop offset="100%" stopColor={SAGE} stopOpacity="0" />
          </radialGradient>

          {/* Wide soft glow for star arms */}
          <filter id="nmap-star-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="22" result="blur" />
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

        {/* Star-arm glow — three radiating beams from Nairobi hub */}
        <g filter="url(#nmap-star-blur)" aria-hidden>
          {STAR_ARMS.map(([hubId, armId]) => {
            const hub = getNode(hubId);
            const arm = getNode(armId);
            if (!hub || !arm) return null;
            const vis = nodeVisible(arm, activeMaterial);
            return (
              <line
                key={`star-glow-${armId}`}
                x1={hub.x}
                y1={hub.y}
                x2={arm.x}
                y2={arm.y}
                stroke={SAGE_LT}
                strokeWidth="22"
                strokeLinecap="round"
                opacity={vis ? 0.38 : 0.05}
                style={{ transition: "opacity 0.4s" }}
              />
            );
          })}
        </g>

        {/* Tapered bloom wedges along each star arm */}
        {STAR_ARMS.map(([hubId, armId]) => {
          const hub = getNode(hubId)!;
          const arm = getNode(armId)!;
          const vis = nodeVisible(arm, activeMaterial);
          const mx = hub.x + (arm.x - hub.x) * 0.48;
          const my = hub.y + (arm.y - hub.y) * 0.48;
          const angle = (Math.atan2(arm.y - hub.y, arm.x - hub.x) * 180) / Math.PI;
          const armLen = Math.hypot(arm.x - hub.x, arm.y - hub.y);
          return (
            <ellipse
              key={`arm-bloom-${armId}`}
              cx={mx}
              cy={my}
              rx={armLen * 0.22}
              ry={armLen * 0.07}
              fill="url(#nmap-arm-bloom)"
              opacity={vis ? 0.9 : 0.12}
              transform={`rotate(${angle} ${mx} ${my})`}
              style={{ transition: "opacity 0.4s" }}
            />
          );
        })}

        {/* Hub core — tight stellar centre (replaces wide elliptical blob) */}
        <circle cx={nairobi.x} cy={nairobi.y} r="28" fill="url(#nmap-hub-bloom)" />

        {/* Ambient star field */}
        {AMBIENT.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={SAGE} opacity={d.o} />
        ))}

        {/* ── Primary star arms (crisp) ── */}
        {STAR_ARMS.map(([a, b]) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;
          const vis = nodeVisible(nb, activeMaterial);
          return (
            <line
              key={`star-${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={SAGE}
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity={vis ? 0.72 : 0.06}
              style={{ transition: "opacity 0.4s" }}
            />
          );
        })}

        {/* ── Secondary edges ── */}
        {EDGES.filter(([a, b]) => !isStarArm(a, b)).map(([a, b]) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;
          const visA = nodeVisible(na, activeMaterial);
          const visB = nodeVisible(nb, activeMaterial);
          const eitherVis = visA || visB;
          const hubSpoke = na.id === "nairobi" || nb.id === "nairobi";

          let opacity: number;
          let stroke: string;
          let width: number;

          if (!eitherVis) {
            opacity = 0.05;
            stroke = "#3a3a3a";
            width = 0.5;
          } else if (hubSpoke) {
            opacity = 0.16;
            stroke = "#6e6e6e";
            width = 0.65;
          } else {
            opacity = 0.1;
            stroke = "#4a4a4a";
            width = 0.5;
          }

          return (
            <line
              key={`${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={stroke}
              strokeWidth={width}
              opacity={opacity}
              style={{ transition: "opacity 0.4s" }}
            />
          );
        })}

        {/* ── Animated flow on star arms only ── */}
        {STAR_ARMS.map(([a, b]) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;
          if (!nodeVisible(nb, activeMaterial)) return null;
          return (
            <line
              key={`flow-${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={SAGE_LT}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.45"
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
                  {/* Star outline — arms align to regional hubs */}
                  {STAR_ARMS.map(([, armId]) => {
                    const arm = getNode(armId);
                    if (!arm) return null;
                    return (
                      <line
                        key={`star-ray-${armId}`}
                        x1={node.x}
                        y1={node.y}
                        x2={arm.x}
                        y2={arm.y}
                        stroke={SAGE}
                        strokeWidth="0.35"
                        strokeOpacity="0.2"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  <circle cx={node.x} cy={node.y} r="18" fill="none"
                    stroke={SAGE} strokeWidth="0.35" opacity="0.14" />
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