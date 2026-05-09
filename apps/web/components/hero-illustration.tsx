// ─────────────────────────────────────────────────────────────────────────────
// Hero Illustration — abstract network topology fragment.
// Positioned as an absolute overlay behind hero text. Corner clusters frame
// the headline without competing with it. Three nodes breathe slowly.
// ─────────────────────────────────────────────────────────────────────────────

// Node coordinates within viewBox 0 0 1280 580
const NODES = [
  // Top-left cluster
  { id: "tl1", x: 48,   y: 38,  r: 2,   dim: true,  anim: null    },
  { id: "tl2", x: 168,  y: 18,  r: 2.5, dim: false, anim: "a"     }, // breathes
  { id: "tl3", x: 92,   y: 112, r: 2,   dim: true,  anim: null    },
  { id: "tl4", x: 235,  y: 72,  r: 2,   dim: true,  anim: null    },
  { id: "tl5", x: 28,   y: 195, r: 1.5, dim: true,  anim: null    },

  // Top-right cluster
  { id: "tr1", x: 1248, y: 42,  r: 2,   dim: true,  anim: null    },
  { id: "tr2", x: 1118, y: 22,  r: 2.5, dim: false, anim: "b"     }, // breathes
  { id: "tr3", x: 1198, y: 128, r: 2,   dim: true,  anim: null    },
  { id: "tr4", x: 1045, y: 78,  r: 2,   dim: true,  anim: null    },
  { id: "tr5", x: 1255, y: 188, r: 1.5, dim: true,  anim: null    },

  // Bottom-left cluster
  { id: "bl1", x: 62,   y: 468, r: 2,   dim: true,  anim: null    },
  { id: "bl2", x: 185,  y: 498, r: 2,   dim: true,  anim: null    },
  { id: "bl3", x: 105,  y: 392, r: 1.5, dim: true,  anim: null    },
  { id: "bl4", x: 248,  y: 455, r: 2,   dim: true,  anim: null    },

  // Bottom-right cluster
  { id: "br1", x: 1228, y: 465, r: 2.5, dim: false, anim: "c"     }, // breathes
  { id: "br2", x: 1098, y: 498, r: 2,   dim: true,  anim: null    },
  { id: "br3", x: 1168, y: 385, r: 1.5, dim: true,  anim: null    },
  { id: "br4", x: 1032, y: 450, r: 2,   dim: true,  anim: null    },

  // Sparse mid — creates horizontal depth
  { id: "m1",  x: 555,  y: 28,  r: 1.5, dim: true,  anim: null    },
  { id: "m2",  x: 730,  y: 48,  r: 1.5, dim: true,  anim: null    },
  { id: "m3",  x: 548,  y: 552, r: 1.5, dim: true,  anim: null    },
  { id: "m4",  x: 735,  y: 535, r: 1.5, dim: true,  anim: null    },
];

const EDGES: [string, string][] = [
  // Top-left internal
  ["tl1", "tl2"], ["tl1", "tl3"], ["tl2", "tl4"], ["tl3", "tl5"], ["tl2", "tl5"],
  // Top-right internal
  ["tr1", "tr2"], ["tr1", "tr3"], ["tr2", "tr4"], ["tr3", "tr5"], ["tr2", "tr5"],
  // Bottom-left internal
  ["bl1", "bl2"], ["bl1", "bl3"], ["bl2", "bl4"], ["bl3", "bl4"],
  // Bottom-right internal
  ["br1", "br2"], ["br1", "br3"], ["br2", "br4"], ["br3", "br4"],
  // Sparse horizontal bands (very faint long lines)
  ["tl4", "m1"], ["m1", "m2"], ["m2", "tr4"],
  ["bl4", "m3"], ["m3", "m4"], ["m4", "br4"],
];

function getNode(id: string) {
  return NODES.find((n) => n.id === id);
}

export function HeroIllustration() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <svg
        viewBox="0 0 1280 580"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Connection lines */}
        {EDGES.map(([a, b]) => {
          const na = getNode(a);
          const nb = getNode(b);
          if (!na || !nb) return null;
          // Long mid-span lines get extra faint treatment
          const isLong = (a.startsWith("m") || b.startsWith("m")) && !a.includes("bl") && !a.includes("tl") && !a.includes("br") && !a.includes("tr");
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke="#2c2c2c"
              strokeWidth="0.7"
              opacity={isLong ? "0.25" : "0.5"}
            />
          );
        })}

        {/* Regular nodes */}
        {NODES.filter((n) => !n.anim).map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={node.dim ? "#262626" : "#3a3a3a"}
            opacity="0.65"
          />
        ))}

        {/* Animated breathing nodes */}
        {NODES.filter((n) => n.anim).map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="#A8BFA6"
            className={`animate-node-${node.anim}`}
          />
        ))}
      </svg>
    </div>
  );
}
